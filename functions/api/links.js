// Mengambil link milik username tertentu (?username=aries)
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get('username') || 'aries').trim().toLowerCase();
    const isAdmin = url.searchParams.get('admin') === 'true' || url.searchParams.get('all') === 'true';

    // Utamakan link Spotlight di paling atas, lalu urutkan dari yang terbaru
    const { results } = await env.DB.prepare(
      'SELECT * FROM user_links WHERE LOWER(username) = ? ORDER BY is_spotlight DESC, id DESC'
    ).bind(username).all();

    // Ambil status is_pro pengguna
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(username).first();

    const isPro = user ? user.is_pro === 1 : false;
    const now = new Date();

    // Saring tautan berdasarkan jadwal dan amankan PIN untuk pengunjung publik
    const links = (results || []).filter((link) => {
      // Jika diakses dari dasbor admin, tampilkan semua tanpa penyaringan
      if (isAdmin) return true;

      // Saring jadwal mulai tampil
      if (link.schedule_start && new Date(link.schedule_start) > now) {
        return false;
      }

      // Saring batas kedaluwarsa link
      if (link.schedule_end && new Date(link.schedule_end) < now) {
        return false;
      }

      return true;
    }).map((link) => {
      if (isAdmin) return link;

      const hasPin = Boolean(link.pin_code && link.pin_code.trim().length > 0);
      return {
        ...link,
        has_pin: hasPin,
        url: hasPin ? '' : link.url, // Sembunyikan URL asli jika link dikunci PIN
        pin_code: undefined, // Hapus kode PIN asli dari respon JSON publik
      };
    });

    return new Response(
      JSON.stringify({ 
        links, 
        isPro 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Menambah link baru untuk user tertentu (Maksimal 3 link jika bukan Pro)
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { 
      username = 'aries', 
      title, 
      url: linkUrl, 
      description, 
      is_spotlight,
      schedule_start,
      schedule_end,
      pin_code
    } = data;

    if (!title || !linkUrl) {
      return new Response(JSON.stringify({ error: 'Title and URL are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Cek status is_pro pengguna di database
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    const isPro = user ? user.is_pro === 1 : false;

    // 2. Batasi pengguna non-PRO maksimal 3 link
    if (!isPro) {
      const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as total FROM user_links WHERE LOWER(username) = ?'
      ).bind(cleanUsername).first();

      const totalLinks = countResult ? countResult.total : 0;

      if (totalLinks >= 3) {
        return new Response(
          JSON.stringify({ 
            error: 'Free tier limit reached (max 3 links). Upgrade to Pro for unlimited links!' 
          }), 
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Fitur Smart Links (Spotlight, Penjadwalan & PIN) eksklusif untuk akun PRO
    const spotlightValue = isPro && is_spotlight ? 1 : 0;
    const scheduleStartVal = isPro && schedule_start ? schedule_start : null;
    const scheduleEndVal = isPro && schedule_end ? schedule_end : null;
    const pinCodeVal = isPro && pin_code ? pin_code.trim() : null;

    // 3. Simpan link baru ke tabel user_links
    await env.DB.prepare(
      'INSERT INTO user_links (username, title, url, description, is_spotlight, schedule_start, schedule_end, pin_code, clicks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
    ).bind(
      cleanUsername, 
      title.trim(), 
      linkUrl.trim(), 
      description?.trim() || '', 
      spotlightValue,
      scheduleStartVal,
      scheduleEndVal,
      pinCodeVal
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Mengubah status Spotlight link dan atribut Smart Links (Khusus Akun PRO)
export async function onRequestPatch({ request, env }) {
  try {
    const data = await request.json();
    const { id, username, is_spotlight, schedule_start, schedule_end, pin_code } = data;

    if (!id || !username) {
      return new Response(JSON.stringify({ error: 'Missing link id or username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Validasi hak akses akun PRO
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    if (!user || user.is_pro !== 1) {
      return new Response(
        JSON.stringify({ error: 'Fitur Smart Link & Spotlight khusus untuk akun PRO.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare(`
      UPDATE user_links 
      SET 
        is_spotlight = COALESCE(?, is_spotlight),
        schedule_start = COALESCE(?, schedule_start),
        schedule_end = COALESCE(?, schedule_end),
        pin_code = COALESCE(?, pin_code)
      WHERE id = ? AND LOWER(username) = ?
    `).bind(
      is_spotlight !== undefined ? (is_spotlight ? 1 : 0) : null,
      schedule_start !== undefined ? schedule_start : null,
      schedule_end !== undefined ? schedule_end : null,
      pin_code !== undefined ? pin_code : null,
      id,
      cleanUsername
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Menghapus link dengan validasi kepemilikan username
export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const username = (url.searchParams.get('username') || '').trim().toLowerCase();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing link id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (username) {
      await env.DB.prepare('DELETE FROM user_links WHERE id = ? AND LOWER(username) = ?').bind(id, username).run();
    } else {
      await env.DB.prepare('DELETE FROM user_links WHERE id = ?').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}