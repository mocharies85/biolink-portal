// Endpoint untuk membaca dan mengupdate data profil
export async function onRequestGet({ env }) {
  try {
    const profile = await env.DB.prepare(
      'SELECT * FROM profile WHERE id = 1'
    ).first();

    return new Response(JSON.stringify({ profile }), {
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
    const { name, tagline, bio, avatar } = data;

    await env.DB.prepare(`
      INSERT INTO profile (id, name, tagline, bio, avatar)
      VALUES (1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        tagline = excluded.tagline,
        bio = excluded.bio,
        avatar = excluded.avatar
    `).bind(
      name?.trim() || 'New Creator',
      tagline?.trim() || '',
      bio?.trim() || '',
      avatar?.trim() || ''
    ).run();

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