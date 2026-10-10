// Mengambil link milik username tertentu (?username=aries)
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'aries';

    const { results } = await env.DB.prepare(
      'SELECT * FROM user_links WHERE username = ? ORDER BY id DESC'
    ).bind(username).all();

    return new Response(JSON.stringify({ links: results }), {
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

// Menambah link baru untuk user tertentu
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { username = 'aries', title, url: linkUrl, description } = data;

    if (!title || !linkUrl) {
      return new Response(JSON.stringify({ error: 'Title and URL are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      'INSERT INTO user_links (username, title, url, description) VALUES (?, ?, ?, ?)'
    ).bind(username, title.trim(), linkUrl.trim(), description?.trim() || '').run();

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

// Menghapus link berdasarkan ID
export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing link id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare('DELETE FROM user_links WHERE id = ?').bind(id).run();

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