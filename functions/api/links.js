// Endpoint serverless untuk mengelola link (GET, POST, DELETE)
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM links ORDER BY id ASC'
    ).all();

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

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const title = data.title?.trim();
    const url = data.url?.trim();
    const description = data.description?.trim() || '';

    if (!title || !url) {
      return new Response(JSON.stringify({ error: 'Title dan URL wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const info = await env.DB.prepare(
      'INSERT INTO links (title, url, description, is_active, clicks) VALUES (?, ?, ?, 1, 0)'
    ).bind(title, url, description).run();

    return new Response(JSON.stringify({ success: true, id: info.meta.last_row_id }), {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID link wajib disertakan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();

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