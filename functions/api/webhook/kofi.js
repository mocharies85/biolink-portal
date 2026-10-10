export async function onRequestPost({ request, env }) {
  try {
    let payload = null;
    const contentType = request.headers.get('content-type') || '';

    // Ko-fi mengirim data via application/x-www-form-urlencoded dengan field "data"
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      const rawData = formData.get('data');
      if (rawData) {
        payload = JSON.parse(rawData);
      }
    }

    if (!payload) {
      return new Response('No data received from webhook', { status: 400 });
    }

    // Verifikasi Token Ko-fi jika disetel di Cloudflare Environment Variables
    if (env.KOFI_VERIFICATION_TOKEN && payload.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
      return new Response('Unauthorized token', { status: 403 });
    }

    const payerEmail = payload.email ? payload.email.trim().toLowerCase() : '';
    const message = payload.message || '';

    let matchedUser = null;

    // 1. Cocokkan pengguna berdasarkan email yang terdaftar
    if (payerEmail) {
      matchedUser = await env.DB.prepare(
        'SELECT id, username FROM users WHERE LOWER(email) = ?'
      ).bind(payerEmail).first();
    }

    // 2. Jika email tidak cocok (misal user pakai email PayPal yang berbeda),
    // sistem otomatis mencari username yang ditulis di pesan (misal: "vant" atau "@vant")
    if (!matchedUser && message) {
      const words = message.replace(/[@#]/g, ' ').split(/\s+/).map(w => w.trim().toLowerCase()).filter(Boolean);
      for (const word of words) {
        const found = await env.DB.prepare(
          'SELECT id, username FROM users WHERE LOWER(username) = ?'
        ).bind(word).first();
        if (found) {
          matchedUser = found;
          break;
        }
      }
    }

    // 3. Jika pengguna ditemukan, aktifkan akun PRO secara instan
    if (matchedUser) {
      await env.DB.prepare(
        'UPDATE users SET is_pro = 1 WHERE id = ?'
      ).bind(matchedUser.id).run();

      return new Response(
        JSON.stringify({ success: true, activated: matchedUser.username }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Tetap kembalikan 200 agar Ko-fi tidak terus-menerus mencoba ulang (retry loop)
    return new Response(
      JSON.stringify({ success: false, message: 'User not found in database' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}