export async function onRequestPost({ request, env }) {
  try {
    const { identity, password } = await request.json();

    if (!identity || !password) {
      return new Response(
        JSON.stringify({ error: 'Username/Email and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanIdentity = identity.trim().toLowerCase();

    // 1. Tambahkan kolom is_verified pada query SELECT
    const user = await env.DB.prepare(
      'SELECT username, email, password_hash, role, is_pro, is_verified FROM users WHERE username = ? OR email = ?'
    ).bind(cleanIdentity, cleanIdentity).first();

    // 2. Verifikasi keberadaan akun dan kecocokan password
    if (!user || user.password_hash !== password) {
      return new Response(
        JSON.stringify({ error: 'Invalid username/email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Cegah login jika email belum diverifikasi
    if (!user.is_verified || Number(user.is_verified) === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Please verify your email address before signing in. Check your inbox or spam folder.' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          is_pro: user.is_pro,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}