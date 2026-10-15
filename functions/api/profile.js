// functions/api/profile.js

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const rawUsername = url.searchParams.get('username') || 'aries';
    const username = rawUsername.trim().toLowerCase();

    let profile = await env.DB.prepare(
      'SELECT * FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    if (!profile) {
      profile = {
        username,
        name: rawUsername.toUpperCase(),
        tagline: 'Digital Creator',
        bio: `Welcome to the official hub of @${rawUsername}.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        views: 0,
        socials: '{}',
        og_title: '',
        og_description: '',
        og_image: '',
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

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { 
      username = 'aries', 
      name, 
      tagline, 
      bio, 
      avatar, 
      socials,
      og_title,
      og_description,
      og_image
    } = data;

    const cleanUsername = username.trim().toLowerCase();
    const socialsJson = typeof socials === 'object' ? JSON.stringify(socials) : (socials || '{}');

    await env.DB.prepare(`
      INSERT INTO user_profiles (
        username, name, tagline, bio, avatar, socials, 
        og_title, og_description, og_image, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET
        name = excluded.name,
        tagline = excluded.tagline,
        bio = excluded.bio,
        avatar = excluded.avatar,
        socials = excluded.socials,
        og_title = excluded.og_title,
        og_description = excluded.og_description,
        og_image = excluded.og_image,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      cleanUsername,
      name?.trim() || cleanUsername,
      tagline?.trim() || '',
      bio?.trim() || '',
      avatar?.trim() || '',
      socialsJson,
      og_title?.trim() || '',
      og_description?.trim() || '',
      og_image?.trim() || ''
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