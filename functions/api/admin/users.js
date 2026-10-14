// functions/api/admin/users.js

const MASTER_PIN = '586042';

// 1. GET: Ambil Statistik, Pengguna + Analitik Keaktifan (Kebal Crash)
export async function onRequestGet({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (!clientPin || clientPin.trim() !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Invalid security PIN. Access denied.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Hitung statistik dasar pengguna
    let total = 0;
    let pro = 0;
    let free = 0;
    try {
      const statsRes = await env.DB.prepare(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as total_pro,
          SUM(CASE WHEN is_pro = 0 OR is_pro IS NULL THEN 1 ELSE 0 END) as total_free
        FROM users
      `).first();
      total = statsRes?.total_users || 0;
      pro = statsRes?.total_pro || 0;
      free = statsRes?.total_free || 0;
    } catch (e) {
      console.warn('Stats fallback:', e);
    }
    const estimatedRevenue = pro * 3;

    // 2. Ambil data users dasar (Pasti Berhasil)
    const { results: rawUsers } = await env.DB.prepare(`
      SELECT id, username, email, COALESCE(is_pro, 0) as is_pro, COALESCE(role, 'creator') as role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();

    // 3. Ambil data analitik dengan proteksi try-catch mandiri
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
    const users = (rawUsers || []).map((u) => {
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

    // 4. Ambil pesan dukungan (support messages)
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
      stats: { total, pro, free, estimatedRevenue },
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

// 2. PATCH: Toggle Status PRO / Free
export async function onRequestPatch({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (!clientPin || clientPin.trim() !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { userId, username, is_pro } = await request.json();
    const newPro = is_pro ? 1 : 0;

    if (userId) {
      await env.DB.prepare(`UPDATE users SET is_pro = ? WHERE id = ?`).bind(newPro, userId).run();
    } else if (username) {
      await env.DB.prepare(`UPDATE users SET is_pro = ? WHERE LOWER(username) = LOWER(?)`).bind(newPro, username).run();
    }

    return new Response(JSON.stringify({ success: true, is_pro: newPro }), {
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