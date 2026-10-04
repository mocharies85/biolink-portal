// Endpoint serverless untuk menangani pesan masuk (GET & POST)
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const sender = data.sender?.trim() || 'Anonymous';
    const content = data.content?.trim();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Message content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simpan pesan ke Cloudflare D1
    await env.DB.prepare(
      'INSERT INTO messages (sender, content) VALUES (?, ?)'
    ).bind(sender, content).run();

    return new Response(JSON.stringify({ success: true, message: 'Message saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet({ env }) {
  try {
    // Ambil daftar pesan terbaru dari D1
    const { results } = await env.DB.prepare(
      'SELECT * FROM messages ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify({ messages: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}