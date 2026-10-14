// functions/api/admin/users.js

const MASTER_PIN = '586042';

// 1. GET: Ambil Statistik, Pengguna + Analitik Keaktifan, dan Pesan Tiket
export async function onRequestGet({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (clientPin !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hitung statistik global
    const totalStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as total_pro,
        SUM(CASE WHEN is_pro = 0 OR is_pro IS NULL THEN 1 ELSE 0 END) as total_free
      FROM users
    `).first();

    const total = totalStats?.total_users || 0;
    const pro = totalStats?.total_pro || 0;
    const free = totalStats?.total_free || 0;
    const estimatedRevenue = pro * 3;

    // Ambil data users dengan analitik keaktifan (Views, Clicks, Links, Stories)
    const { results: users } = await env.DB.prepare(`
      SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(u.is_pro, 0) as is_pro,
        COALESCE(u.role, 'creator') as role,
        u.created_at,
        COALESCE(p.views, 0) as total_views,
        COUNT(DISTINCT l.id) as total_links,
        COALESCE(SUM(l.clicks), 0) as total_clicks,
        COUNT(DISTINCT s.id) as active_stories
      FROM users u
      LEFT JOIN user_profiles p ON LOWER(p.username) = LOWER(u.username)
      LEFT JOIN links l ON LOWER(l.username) = LOWER(u.username)
      LEFT JOIN stories s ON LOWER(s.username) = LOWER(u.username) AND s.expires_at > datetime('now')
      GROUP BY u.id, u.username, u.email, u.is_pro, u.role, u.created_at, p.views
      ORDER BY (COALESCE(p.views, 0) + COALESCE(SUM(l.clicks), 0) * 2) DESC, u.created_at DESC
    `).all();

    // Ambil tiket dukungan (support messages)
    let messages = [];
    try {
      const msgRes = await env.DB.prepare(`
        SELECT id, username, email, message, created_at 
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 50
      `).all();
      messages = msgRes.results || [];
    } catch {
      messages = [];
    }

    return new Response(JSON.stringify({
      stats: { total, pro, free, estimatedRevenue },
      users: users || [],
      messages: messages || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. PATCH: Toggle status PRO / Free
export async function onRequestPatch({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (clientPin !== MASTER_PIN) {
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

// 3. DELETE: Hapus akun testing & bersihkan data terkait di database D1
export async function onRequestDelete({ request, env }) {
  try {
    const clientPin = request.headers.get('x-admin-pin');
    if (clientPin !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { status: 400 });
    }

    // Proteksi: jangan hapus akun utama
    if (username.toLowerCase() === 'aries') {
      return new Response(JSON.stringify({ error: 'Cannot delete the primary Superadmin account' }), { status: 403 });
    }

    // Bersihkan dari seluruh tabel di D1
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM users WHERE LOWER(username) = LOWER(?)`).bind(username),
      env.DB.prepare(`DELETE FROM user_profiles WHERE LOWER(username) = LOWER(?)`).bind(username),
      env.DB.prepare(`DELETE FROM links WHERE LOWER(username) = LOWER(?)`).bind(username),
      env.DB.prepare(`DELETE FROM stories WHERE LOWER(username) = LOWER(?)`).bind(username),
      env.DB.prepare(`DELETE FROM messages WHERE LOWER(username) = LOWER(?)`).bind(username)
    ]);

    return new Response(JSON.stringify({ success: true, message: `Account @${username} deleted successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}