// Helper to hash password with SHA-256
async function hashPassword(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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

    // 1. Fetch user record with id and case-insensitive matching
    const user = await env.DB.prepare(
      `SELECT id, username, email, password_hash, role, is_pro, is_verified 
       FROM users 
       WHERE LOWER(username) = ? OR LOWER(email) = ?`
    )
      .bind(cleanIdentity, cleanIdentity)
      .first();

    // 2. Check user existence
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid username/email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify password (supports both SHA-256 hashed and legacy plain text)
    const hashedInput = await hashPassword(password);
    const isPasswordValid =
      user.password_hash === password || user.password_hash === hashedInput;

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid username/email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Ensure email is verified before permitting access
    if (user.is_verified !== undefined && Number(user.is_verified) === 0) {
      return new Response(
        JSON.stringify({
          error: 'Please verify your email address before signing in. Check your inbox or spam folder.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Return authenticated user payload
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          is_pro: Number(user.is_pro) === 1 ? 1 : 0,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error occurred during authentication.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}