// functions/api/music.js

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM music_tracks ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify({ tracks: results || [] }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, tracks: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { title, category, duration, url } = data;

    if (!title || !url) {
      return new Response(JSON.stringify({ error: 'Title and Audio URL are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = 'track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    await env.DB.prepare(
      'INSERT INTO music_tracks (id, title, category, duration, url) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      id,
      title.trim(),
      category?.trim() || 'General',
      duration?.trim() || '1:30',
      url.trim()
    ).run();

    return new Response(JSON.stringify({ success: true, id }), {
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

export async function onRequestDelete({ request, env }) {
  try {
    const reqUrl = new URL(request.url);
    const id = reqUrl.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Track ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare('DELETE FROM music_tracks WHERE id = ?').bind(id).run();

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