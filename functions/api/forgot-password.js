export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cari user berdasarkan email
    const user = await env.DB.prepare(
      'SELECT id, username FROM users WHERE LOWER(email) = ?'
    ).bind(cleanEmail).first();

    if (!user) {
      // Demi keamanan, tetap beri respon sukses agar email tidak mudah ditebak
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Buat token unik dan masa berlaku 1 jam
    const resetToken = crypto.randomUUID();
    const expiresAt = Date.now() + 3600000; // 1 jam ke depan

    await env.DB.prepare(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?'
    ).bind(resetToken, expiresAt, user.id).run();

    // 3. Kirim email melalui Resend API
    const url = new URL(request.url);
    const resetUrl = `${url.origin}/reset-password?token=${resetToken}`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Curiolot Security <support@curiolot.com>',
        to: [cleanEmail],
        subject: 'Reset Password Request - Curiolot Link',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #27272a; border-radius: 12px; background: #09090b; color: #f4f4f5;">
            <h2 style="color: #10b981;">Reset Password</h2>
            <p>Halo <strong>@${user.username}</strong>,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Curiolot Link Anda. Klik tombol di bawah untuk membuat kata sandi baru:</p>
            <div style="margin: 25px 0;">
              <a href="${resetUrl}" style="background: #10b981; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #a1a1aa;">Tautan ini hanya berlaku selama 1 jam. Abaikan email ini jika Anda tidak merasa meminta reset password.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errRes = await emailResponse.text();
      return new Response(JSON.stringify({ error: 'Gagal mengirim email: ' + errRes }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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