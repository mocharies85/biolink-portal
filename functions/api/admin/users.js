// Master PIN rahasia Superadmin (bisa Anda ubah kapan saja di sini)
const MASTER_PIN = '586042';

export async function onRequestGet({ request, env }) {
  try {
    // 1. Verifikasi PIN Keamanan
    const clientPin = request.headers.get('x-admin-pin');
    if (clientPin !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Hitung statistik pengguna
    const totalStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as total_pro,
        SUM(CASE WHEN is_pro = 0 OR is_pro IS NULL THEN 1 ELSE 0 END) as total_free
      FROM users
    `).first();

    // 3. Ambil data 50 user terbaru
    const users = await env.DB.prepare(
      'SELECT id, username, email, role, is_pro, created_at FROM users ORDER BY id DESC LIMIT 50'
    ).all();

    // 4. Ambil 50 pesan dukungan terbaru
    const messages = await env.DB.prepare(
      'SELECT * FROM support_messages ORDER BY id DESC LIMIT 50'
    ).all();

    return new Response(JSON.stringify({
      stats: {
        total: totalStats?.total_users || 0,
        pro: totalStats?.total_pro || 0,
        free: totalStats?.total_free || 0,
        estimatedRevenue: (totalStats?.total_pro || 0) * 3,
      },
      users: users.results || [],
      messages: messages.results || [],
    }), {
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

// Endpoint untuk mengubah status PRO secara manual oleh admin
export async function onRequestPatch({ request, env }) {
  try {
    // 1. Verifikasi PIN Keamanan
    const clientPin = request.headers.get('x-admin-pin');
    if (clientPin !== MASTER_PIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, is_pro } = await request.json();

    await env.DB.prepare(
      'UPDATE users SET is_pro = ? WHERE id = ?'
    ).bind(is_pro ? 1 : 0, userId).run();

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