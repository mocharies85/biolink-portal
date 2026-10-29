// functions/api/admin/users.js

const MASTER_PIN = '586042';

// 1. GET: Ambil Statistik, Pengguna + Analitik Keaktifan (Pisahkan Paid & Gift PRO)
export async function onRequestGet({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (!clientPin || clientPin.trim() !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Invalid security PIN. Access denied.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Ambil data users lengkap dengan kolom pro_type dan pro_expires_at
    const { results: rawUsers } = await env.DB.prepare(`
      SELECT 
        id, 
        username, 
        email, 
        COALESCE(is_pro, 0) as is_pro, 
        COALESCE(pro_type, CASE WHEN is_pro = 1 THEN 'paid' ELSE 'free' END) as pro_type,
        pro_expires_at,
        COALESCE(role, 'creator') as role, 
        created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();

    // 2. Evaluasi status kedaluwarsa Gift PRO secara real-time
    const now = new Date();
    const sanitizedUsers = [];

    for (const u of (rawUsers || [])) {
      let currentIsPro = Number(u.is_pro) === 1 ? 1 : 0;
      let currentProType = u.pro_type || (currentIsPro ? 'paid' : 'free');
      let currentExpiresAt = u.pro_expires_at;

      // Jika akun tipe gift dan memiliki batas kedaluwarsa yang sudah lewat
      if (currentIsPro && currentProType === 'gift' && currentExpiresAt) {
        if (new Date(currentExpiresAt) < now) {
          currentIsPro = 0;
          currentProType = 'free';
          currentExpiresAt = null;

          // Sinkronisasi pembaruan kembali ke database D1
          try {
            await env.DB.prepare(
              `UPDATE users SET is_pro = 0, pro_type = 'free', pro_expires_at = NULL WHERE id = ?`
            ).bind(u.id).run();
          } catch (dbErr) {
            console.warn('Auto-expire sync error:', dbErr);
          }
        }
      }

      sanitizedUsers.push({
        ...u,
        is_pro: currentIsPro,
        pro_type: currentProType,
        pro_expires_at: currentExpiresAt,
      });
    }

    // 3. Hitung statistik riil (Est. Revenue MURNI hanya dari member 'paid')
    const total = sanitizedUsers.length;
    const paidPro = sanitizedUsers.filter((u) => u.is_pro === 1 && u.pro_type === 'paid').length;
    const giftPro = sanitizedUsers.filter((u) => u.is_pro === 1 && u.pro_type === 'gift').length;
    const pro = paidPro + giftPro;
    const free = total - pro;
    const estimatedRevenue = paidPro * 3; // $5/bulan murni dari pelanggan berbayar

    // 4. Ambil data analitik dengan proteksi try-catch mandiri
    // Views dari user_profiles
    let viewsMap = {};
    try {
      const { results: profileViews } = await env.DB.prepare(`
        SELECT username, COALESCE(views, 0) as views FROM user_profiles
      `).all();
      if (profileViews) {
        for (const p of profileViews) {
          if (p.username) viewsMap[p.username.toLowerCase()] = p.views || 0;
        }
      }
    } catch (e) {
      console.warn('user_profiles views query skipped:', e);
    }

    // Links & clicks dari links
    let linksMap = {};
    try {
      const { results: linksStats } = await env.DB.prepare(`
        SELECT username, COUNT(*) as link_count, COALESCE(SUM(clicks), 0) as click_count 
        FROM links 
        GROUP BY username
      `).all();
      if (linksStats) {
        for (const l of linksStats) {
          if (l.username) linksMap[l.username.toLowerCase()] = { links: l.link_count || 0, clicks: l.click_count || 0 };
        }
      }
    } catch (e) {
      console.warn('links query skipped:', e);
    }

    // Stories aktif dari stories
    let storiesMap = {};
    try {
      const { results: storiesStats } = await env.DB.prepare(`
        SELECT username, COUNT(*) as story_count 
        FROM stories 
        WHERE expires_at > datetime('now') 
        GROUP BY username
      `).all();
      if (storiesStats) {
        for (const s of storiesStats) {
          if (s.username) storiesMap[s.username.toLowerCase()] = s.story_count || 0;
        }
      }
    } catch (e) {
      console.warn('stories query skipped:', e);
    }

    // Satukan data user dengan analitik keaktifan
    const users = sanitizedUsers.map((u) => {
      const uname = (u.username || '').toLowerCase();
      const lData = linksMap[uname] || { links: 0, clicks: 0 };
      return {
        ...u,
        total_views: viewsMap[uname] || 0,
        total_links: lData.links,
        total_clicks: lData.clicks,
        active_stories: storiesMap[uname] || 0,
      };
    });

    // Urutkan kreator paling aktif ke atas
    users.sort((a, b) => {
      const scoreA = (a.total_views || 0) + (a.total_clicks || 0) * 2;
      const scoreB = (b.total_views || 0) + (b.total_clicks || 0) * 2;
      return scoreB - scoreA;
    });

    // 5. Ambil pesan dukungan (support messages)
    let messages = [];
    try {
      const msgRes = await env.DB.prepare(`
        SELECT id, username, email, message, created_at 
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 50
      `).all();
      messages = msgRes.results || [];
    } catch (e) {
      console.warn('messages query skipped:', e);
    }

    return new Response(JSON.stringify({
      stats: { 
        total, 
        pro, 
        paid_pro: paidPro, 
        gift_pro: giftPro, 
        free, 
        estimatedRevenue 
      },
      users,
      messages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Server Error: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 2. PATCH: Kelola Status PRO (Mendukung Gift dengan Pilihan Durasi & Revoke)
export async function onRequestPatch({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (!clientPin || clientPin.trim() !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { userId, username, is_pro, pro_type, duration_days, action } = await request.json();

    let newIsPro = is_pro ? 1 : 0;
    let newProType = pro_type || (newIsPro ? 'paid' : 'free');
    let newExpiresAt = null;

    // Aksi pemberian Gift PRO dengan opsi durasi
    if (action === 'grant_gift' || pro_type === 'gift') {
      newIsPro = 1;
      newProType = 'gift';
      if (duration_days && Number(duration_days) > 0) {
        const exp = new Date();
        exp.setDate(exp.getDate() + Number(duration_days));
        newExpiresAt = exp.toISOString();
      } else {
        newExpiresAt = null; // Lifetime / Permanen
      }
    } 
    // Aksi pencabutan PRO (Revoke)
    else if (action === 'revoke' || newIsPro === 0) {
      newIsPro = 0;
      newProType = 'free';
      newExpiresAt = null;
    } 
    // Akun berbayar (Paid)
    else if (newIsPro === 1 && newProType !== 'gift') {
      newProType = 'paid';
      newExpiresAt = null;
    }

    const query = userId
      ? `UPDATE users SET is_pro = ?, pro_type = ?, pro_expires_at = ? WHERE id = ?`
      : `UPDATE users SET is_pro = ?, pro_type = ?, pro_expires_at = ? WHERE LOWER(username) = LOWER(?)`;
    const identifier = userId || username;

    await env.DB.prepare(query).bind(newIsPro, newProType, newExpiresAt, identifier).run();

    return new Response(JSON.stringify({ 
      success: true, 
      is_pro: newIsPro, 
      pro_type: newProType, 
      pro_expires_at: newExpiresAt 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 3. DELETE: Hapus Akun Pengguna Secara Aman
export async function onRequestDelete({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (!clientPin || clientPin.trim() !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { status: 400 });
    }

    // Proteksi: cegah penghapusan akun Superadmin utama (@aries)
    if (username.toLowerCase() === 'aries') {
      return new Response(JSON.stringify({ error: 'Cannot delete the primary Superadmin account' }), { status: 403 });
    }

    // Hapus dari tabel utama users
    await env.DB.prepare(`DELETE FROM users WHERE LOWER(username) = LOWER(?)`).bind(username).run();

    // Hapus data terkait secara aman (jika tabel tersedia di D1)
    try { await env.DB.prepare(`DELETE FROM user_profiles WHERE LOWER(username) = LOWER(?)`).bind(username).run(); } catch {}
    try { await env.DB.prepare(`DELETE FROM links WHERE LOWER(username) = LOWER(?)`).bind(username).run(); } catch {}
    try { await env.DB.prepare(`DELETE FROM stories WHERE LOWER(username) = LOWER(?)`).bind(username).run(); } catch {}
    try { await env.DB.prepare(`DELETE FROM messages WHERE LOWER(username) = LOWER(?)`).bind(username).run(); } catch {}

    return new Response(JSON.stringify({ success: true, message: `Account @${username} deleted successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}