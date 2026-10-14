// functions/api/stories.js

// 1. GET: Ambil story aktif dalam 24 jam terakhir
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, media_url, caption, audio_url, link_url, duration, created_at 
       FROM stories 
       WHERE LOWER(username) = LOWER(?) AND expires_at > datetime('now') 
       ORDER BY created_at ASC`
    ).bind(username).all();

    return new Response(JSON.stringify({ stories: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. POST: Publikasikan story baru dengan validasi durasi (10s, 25s, 60s)
export async function onRequestPost({ request, env }) {
  try {
    const { username, media_url, caption, audio_url, link_url, duration } = await request.json();

    if (!username || !media_url) {
      return new Response(JSON.stringify({ error: 'Username and media_url are required' }), { status: 400 });
    }

    const id = crypto.randomUUID();
    
    // Validasi durasi: 10s (Free), 25s (PRO Foto), atau 60s (PRO Video)
    const validDurations = [10, 25, 60];
    const storyDuration = validDurations.includes(Number(duration)) ? Number(duration) : 10;

    await env.DB.prepare(
      `INSERT INTO stories (id, username, media_url, caption, audio_url, link_url, duration, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+1 day'))`
    ).bind(
      id, 
      username.toLowerCase(), 
      media_url, 
      caption || '', 
      audio_url || null, 
      link_url || null,
      storyDuration
    ).run();

    return new Response(JSON.stringify({ success: true, id, duration: storyDuration }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 3. DELETE: Hapus story tertentu
export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const storyId = url.searchParams.get('id');
    const username = url.searchParams.get('username');

    if (!storyId || !username) {
      return new Response(JSON.stringify({ error: 'Story ID and username are required' }), { status: 400 });
    }

    await env.DB.prepare(
      `DELETE FROM stories WHERE id = ? AND LOWER(username) = LOWER(?)`
    ).bind(storyId, username).run();

    return new Response(JSON.stringify({ success: true, message: 'Story deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}