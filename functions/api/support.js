export async function onRequestPost({ request, env }) {
  try {
    const { username, email, message } = await request.json();

    if (!username || !message) {
      return new Response(JSON.stringify({ error: 'Username dan pesan wajib diisi.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO support_messages (username, email, message, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(username, email || '', message.trim(), 'open', now).run();

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