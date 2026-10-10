export async function onRequestPost({ request, env }) {
  try {
    const { username, email, password } = await request.json();

    // Validasi input dasar
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Username, email, and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (cleanUsername.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Username must be at least 3 characters long.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek apakah username atau email sudah terdaftar
    const existing = await env.DB.prepare(
      'SELECT username, email FROM users WHERE username = ? OR email = ?'
    ).bind(cleanUsername, email.trim().toLowerCase()).first();

    if (existing) {
      const msg = existing.username === cleanUsername ? 'Username is already taken.' : 'Email is already registered.';
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Simpan user ke tabel users
    await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, role, is_pro) VALUES (?, ?, ?, "creator", 0)'
    ).bind(cleanUsername, email.trim().toLowerCase(), password).run();

    // 2. Buat entri profil default di tabel user_profiles
    await env.DB.prepare(`
      INSERT INTO user_profiles (username, name, tagline, bio, avatar)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      cleanUsername,
      cleanUsername.toUpperCase(),
      'Digital Creator',
      `Welcome to the official hub of @${cleanUsername}.`,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
    ).run();

    return new Response(
      JSON.stringify({ success: true, username: cleanUsername }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}