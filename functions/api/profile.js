// Membaca profil berdasarkan parameter ?username=... (default: 'aries')
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'aries';

    let profile = await env.DB.prepare(
      'SELECT * FROM user_profiles WHERE username = ?'
    ).bind(username).first();

    // Jika profil belum ada, buat profil dasar otomatis
    if (!profile) {
      profile = {
        username,
        name: username.toUpperCase(),
        tagline: 'Digital Creator',
        bio: `Welcome to the official hub of @${username}.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
      };
    }

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

// Menyimpan profil user
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { username = 'aries', name, tagline, bio, avatar } = data;

    await env.DB.prepare(`
      INSERT INTO user_profiles (username, name, tagline, bio, avatar, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET
        name = excluded.name,
        tagline = excluded.tagline,
        bio = excluded.bio,
        avatar = excluded.avatar,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      username,
      name?.trim() || username,
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