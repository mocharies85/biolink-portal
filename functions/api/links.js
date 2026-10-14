// Mengambil link milik username tertentu (?username=aries)
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get('username') || 'aries').trim().toLowerCase();

    // Utamakan link Spotlight di paling atas, lalu urutkan dari yang terbaru
    const { results } = await env.DB.prepare(
      'SELECT * FROM user_links WHERE LOWER(username) = ? ORDER BY is_spotlight DESC, id DESC'
    ).bind(username).all();

    // Ambil status is_pro pengguna
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(username).first();

    return new Response(
      JSON.stringify({ 
        links: results || [], 
        isPro: user ? user.is_pro === 1 : false 
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
    const { username = 'aries', title, url: linkUrl, description, is_spotlight } = data;

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

    // Hanya akun PRO yang diizinkan mengaktifkan Spotlight
    const spotlightValue = isPro && is_spotlight ? 1 : 0;

    // 3. Simpan link baru beserta status is_spotlight
    await env.DB.prepare(
      'INSERT INTO user_links (username, title, url, description, is_spotlight, clicks) VALUES (?, ?, ?, ?, ?, 0)'
    ).bind(cleanUsername, title.trim(), linkUrl.trim(), description?.trim() || '', spotlightValue).run();

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

// Mengubah status Spotlight link (Khusus Akun PRO)
export async function onRequestPatch({ request, env }) {
  try {
    const data = await request.json();
    const { id, username, is_spotlight } = data;

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
        JSON.stringify({ error: 'Spotlight link is an exclusive PRO feature.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare(
      'UPDATE user_links SET is_spotlight = ? WHERE id = ? AND LOWER(username) = ?'
    ).bind(is_spotlight ? 1 : 0, id, cleanUsername).run();

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

    // Hapus link dengan memverifikasi ID dan username pemilik
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