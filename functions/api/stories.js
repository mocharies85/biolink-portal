// functions/api/stories.js

// GET: Ambil story aktif beserta audio & link tujuannya
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, media_url, caption, audio_url, link_url, created_at 
       FROM stories 
       WHERE username = ? AND expires_at > datetime('now') 
       ORDER BY created_at ASC`
    ).bind(username.toLowerCase()).all();

    return new Response(JSON.stringify({ stories: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// POST: Buat story baru dengan audio & link CTA
export async function onRequestPost({ request, env }) {
  try {
    const { username, media_url, caption, audio_url, link_url } = await request.json();

    if (!username || !media_url) {
      return new Response(JSON.stringify({ error: 'Username and media_url are required' }), { status: 400 });
    }

    const id = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO stories (id, username, media_url, caption, audio_url, link_url, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+1 day'))`
    ).bind(
      id, 
      username.toLowerCase(), 
      media_url, 
      caption || '', 
      audio_url || null, 
      link_url || null
    ).run();

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}