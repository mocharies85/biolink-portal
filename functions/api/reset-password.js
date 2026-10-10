async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return new Response(JSON.stringify({ error: 'Token and new password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();

    // 1. Cari user dengan token yang masih berlaku
    const user = await env.DB.prepare(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?'
    ).bind(token, now).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Reset link is invalid or has expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Hash kata sandi baru
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update password_hash dan bersihkan token
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?'
    ).bind(hashedPassword, user.id).run();

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