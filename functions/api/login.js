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

    // Cari user berdasarkan username atau email
    const user = await env.DB.prepare(
      'SELECT username, email, password_hash, role, is_pro FROM users WHERE username = ? OR email = ?'
    ).bind(cleanIdentity, cleanIdentity).first();

    // Verifikasi keberadaan akun dan kecocokan password
    if (!user || user.password_hash !== password) {
      return new Response(
        JSON.stringify({ error: 'Invalid username/email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
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