export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { linkId, pin } = await request.json();

    if (!linkId || !pin) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const link = await env.DB.prepare(
      'SELECT id, url, pin_code FROM user_links WHERE id = ?'
    ).bind(linkId).first();

    if (!link || link.pin_code !== pin.trim()) {
      return new Response(JSON.stringify({ error: 'PIN salah. Akses ditolak.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, targetUrl: link.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan sistem' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}