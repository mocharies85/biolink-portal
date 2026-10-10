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
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Username must be at least 3 characters long.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek apakah username atau email sudah terdaftar
    const existing = await env.DB.prepare(
      'SELECT username, email FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?'
    ).bind(cleanUsername, cleanEmail).first();

    if (existing) {
      const msg = existing.username.toLowerCase() === cleanUsername 
        ? 'Username is already taken.' 
        : 'Email is already registered.';
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buat token aktivasi unik
    const verificationToken = crypto.randomUUID();

    // 1. Simpan user ke tabel users (status is_verified = 0)
    await env.DB.prepare(`
      INSERT INTO users (username, email, password_hash, role, is_pro, is_verified, verification_token)
      VALUES (?, ?, ?, 'creator', 0, 0, ?)
    `).bind(cleanUsername, cleanEmail, password, verificationToken).run();

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

    // 3. Kirim Email Verifikasi via Resend
    const activationUrl = `https://link.curiolot.com/api/verify?token=${verificationToken}`;

    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Curiolot Link <noreply@curiolot.com>',
          to: [cleanEmail],
          subject: 'Verify your Curiolot Link Account',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #222; border-radius: 12px; background: #0a0a0a; color: #f5f5f5;">
              <h2 style="color: #10b981; margin-top: 0;">Welcome to Curiolot Link!</h2>
              <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                Hi <strong>@${cleanUsername}</strong>, thank you for joining. Please verify your email address to activate your bio-link and start customizing your hub.
              </p>
              <div style="margin: 28px 0;">
                <a href="${activationUrl}" style="background-color: #10b981; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                  Activate My Account
                </a>
              </div>
              <p style="color: #737373; font-size: 12px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${activationUrl}" style="color: #10b981; word-break: break-all;">${activationUrl}</a>
              </p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        username: cleanUsername,
        needsVerification: true,
        message: 'Account created! Please check your email to activate your account.' 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}