// functions/api/profile.js

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const rawUsername = url.searchParams.get('username') || '';
    const username = rawUsername.trim().toLowerCase();

    // 1. Ambil data profil
    let profile = await env.DB.prepare(
      'SELECT * FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    // 2. Ambil status PRO langsung dari tabel users agar sinkron 100%
    let isPro = 0;
    try {
      const userRow = await env.DB.prepare(
        'SELECT COALESCE(is_pro, 0) as is_pro FROM users WHERE LOWER(username) = ?'
      ).bind(username).first();
      if (userRow) {
        isPro = Number(userRow.is_pro) === 1 ? 1 : 0;
      }
    } catch (e) {
      console.warn('Could not query users table for is_pro:', e);
    }

    if (!profile) {
      profile = {
        username,
        name: rawUsername ? rawUsername.toUpperCase() : 'CREATOR',
        tagline: 'Digital Creator',
        bio: `Welcome to the official hub of @${username}.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        views: 0,
        socials: '{}',
        og_title: '',
        og_description: '',
        og_image: '',
        theme: 'dark',
        bg_image: '',
        featured_video_url: '',
        show_featured_video: 0,
        featured_video_autoplay: 1,
        featured_video_title: '',
        bg_music_url: null,
        bg_music_title: null,
        is_pro: isPro,
      };
    } else {
      profile = {
        ...profile,
        is_pro: isPro,
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
      username, 
      name, 
      tagline, 
      bio, 
      avatar, 
      socials,
      og_title,
      og_description,
      og_image,
      theme = 'dark',
      bg_image = '',
      featured_video_url = '',
      show_featured_video = 0,
      featured_video_autoplay = 1,
      featured_video_title = '',
      bg_music_url = null,
      bg_music_title = null
    } = data;

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const socialsJson = typeof socials === 'object' ? JSON.stringify(socials) : (socials || '{}');

    await env.DB.prepare(`
      INSERT INTO user_profiles (
        username, name, tagline, bio, avatar, socials, 
        og_title, og_description, og_image, theme, bg_image,
        featured_video_url, show_featured_video, featured_video_autoplay, featured_video_title,
        bg_music_url, bg_music_title,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET
        name = excluded.name,
        tagline = excluded.tagline,
        bio = excluded.bio,
        avatar = excluded.avatar,
        socials = excluded.socials,
        og_title = excluded.og_title,
        og_description = excluded.og_description,
        og_image = excluded.og_image,
        theme = excluded.theme,
        bg_image = excluded.bg_image,
        featured_video_url = excluded.featured_video_url,
        show_featured_video = excluded.show_featured_video,
        featured_video_autoplay = excluded.featured_video_autoplay,
        featured_video_title = excluded.featured_video_title,
        bg_music_url = excluded.bg_music_url,
        bg_music_title = excluded.bg_music_title,
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
      og_image?.trim() || '',
      theme || 'dark',
      bg_image?.trim() || '',
      featured_video_url?.trim() || '',
      show_featured_video ? 1 : 0,
      featured_video_autoplay ? 1 : 0,
      featured_video_title?.trim() || '',
      bg_music_url?.trim() || null,
      bg_music_title?.trim() || null
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