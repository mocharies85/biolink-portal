// functions/api/webhook.js

export async function onRequestPost({ request, env }) {
  try {
    const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 });
    }

    const rawBody = await request.text();

    // Verifikasi tanda tangan HMAC SHA-256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBuf = new Uint8Array(
      signature.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuf,
      encoder.encode(rawBody)
    );

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const username = (customData.username || '').toLowerCase().trim();

    if (!username) {
      return new Response(JSON.stringify({ message: 'No username provided' }), { status: 200 });
    }

    // 1. Aktivasi PRO otomatis saat pembayaran sukses
    if (
      eventName === 'order_created' || 
      eventName === 'subscription_created' || 
      eventName === 'subscription_resumed'
    ) {
      await env.DB.prepare(`
        UPDATE users 
        SET is_pro = 1, pro_type = 'paid', pro_expires_at = NULL 
        WHERE LOWER(username) = LOWER(?)
      `).bind(username).run();

      return new Response(JSON.stringify({ success: true, upgraded: username }), { status: 200 });
    }

    // 2. Turunkan akun ke Free jika langganan dibatalkan / expired
    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      await env.DB.prepare(`
        UPDATE users 
        SET is_pro = 0, pro_type = 'free', pro_expires_at = NULL 
        WHERE LOWER(username) = LOWER(?) AND pro_type = 'paid'
      `).bind(username).run();

      return new Response(JSON.stringify({ success: true, revoked: username }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}