// Membaca profil berdasarkan parameter ?username=... (default: 'aries')
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const rawUsername = url.searchParams.get('username') || 'aries';
    const username = rawUsername.trim().toLowerCase();

    let profile = await env.DB.prepare(
      'SELECT * FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    // Jika profil belum ada di database, sediakan struktur dasar otomatis
    if (!profile) {
      profile = {
        username,
        name: rawUsername.toUpperCase(),
        tagline: 'Digital Creator',
        bio: `Welcome to the official hub of @${rawUsername}.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        views: 0,
        socials: '{}',
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

// Menyimpan profil user dan link media sosial
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { username = 'aries', name, tagline, bio, avatar, socials } = data;

    const cleanUsername = username.trim().toLowerCase();
    
    // Pastikan format socials tersimpan sebagai string JSON yang valid
    const socialsJson = typeof socials === 'object' ? JSON.stringify(socials) : (socials || '{}');

    await env.DB.prepare(`
      INSERT INTO user_profiles (username, name, tagline, bio, avatar, socials, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET
        name = excluded.name,
        tagline = excluded.tagline,
        bio = excluded.bio,
        avatar = excluded.avatar,
        socials = excluded.socials,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      cleanUsername,
      name?.trim() || cleanUsername,
      tagline?.trim() || '',
      bio?.trim() || '',
      avatar?.trim() || '',
      socialsJson
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