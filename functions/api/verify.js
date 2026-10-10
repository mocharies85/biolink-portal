export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Invalid or missing verification token.', { status: 400 });
    }

    // Cari user berdasarkan verification_token di database D1
    const user = await env.DB.prepare(
      'SELECT id, username FROM users WHERE verification_token = ?'
    ).bind(token).first();

    if (!user) {
      return new Response(
        'Tautan verifikasi tidak valid atau akun sudah aktif.',
        { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // Aktifkan akun dan hapus token agar tidak bisa dipakai ulang
    await env.DB.prepare(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?'
    ).bind(user.id).run();

    // Alihkan otomatis ke halaman login dengan tanda sukses
    return Response.redirect(`${url.origin}/login?verified=true`, 302);
  } catch (err) {
    return new Response('Internal error: ' + err.message, { status: 500 });
  }
}