// functions/api/stories.js

// 1. GET: Ambil story aktif dalam 24 jam terakhir beserta atribut multi-gambar
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, media_url, caption, audio_url, link_url, duration, media_urls, animation_style, total_duration, created_at 
       FROM stories 
       WHERE LOWER(username) = LOWER(?) AND expires_at > datetime('now') 
       ORDER BY created_at ASC`
    ).bind(username).all();

    // Format nilai default jika ada data null
    const formattedStories = (results || []).map((s) => ({
      ...s,
      duration: s.duration ? Number(s.duration) : 10,
      total_duration: s.total_duration ? Number(s.total_duration) : (s.duration ? Number(s.duration) : 25),
      animation_style: s.animation_style || 'slide',
      media_urls: s.media_urls || null,
    }));

    return new Response(JSON.stringify({ stories: formattedStories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. POST: Publikasikan story baru (single / multi-gambar PRO)
export async function onRequestPost({ request, env }) {
  try {
    const {
      username,
      media_url,
      caption,
      audio_url,
      link_url,
      duration,
      media_urls,
      animation_style,
      total_duration,
    } = await request.json();

    if (!username || (!media_url && !media_urls)) {
      return new Response(JSON.stringify({ error: 'Username and media_url are required' }), { status: 400 });
    }

    const id = crypto.randomUUID();
    
    // Validasi durasi fallback: 10s, 25s, 45s, 60s
    const validDurations = [10, 25, 45, 60];
    const parsedDuration = Number(duration);
    const storyDuration = validDurations.includes(parsedDuration) ? parsedDuration : 10;
    const finalTotalDuration = total_duration ? Number(total_duration) : storyDuration;

    await env.DB.prepare(
      `INSERT INTO stories (
        id, username, media_url, caption, audio_url, link_url, 
        duration, media_urls, animation_style, total_duration, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+1 day'))`
    ).bind(
      id, 
      username.toLowerCase(), 
      media_url || null, 
      caption || '', 
      audio_url || null, 
      link_url || null,
      storyDuration,
      media_urls || null,
      animation_style || 'slide',
      finalTotalDuration
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      id, 
      duration: storyDuration,
      total_duration: finalTotalDuration,
      animation_style: animation_style || 'slide'
    }), {
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