// Mengambil pesan inbox milik username tertentu (?username=aries)
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'aries';

    const { results } = await env.DB.prepare(
      'SELECT * FROM user_messages WHERE username = ? ORDER BY id DESC'
    ).bind(username).all();

    return new Response(JSON.stringify({ messages: results }), {
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

// Mengirim pesan ke inbox pemilik akun
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { username = 'aries', sender, content } = data;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      'INSERT INTO user_messages (username, sender, content) VALUES (?, ?, ?)'
    ).bind(username, sender?.trim() || 'Anonymous', content.trim()).run();

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