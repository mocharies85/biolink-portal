// functions/api/og-image.js

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const rawUsername = url.searchParams.get('username') || '';
    const username = rawUsername.trim().toLowerCase();

    if (!username) {
      return new Response('Username parameter is required', { status: 400 });
    }

    // Ambil data gambar dari database D1
    const profile = await env.DB.prepare(
      'SELECT og_image, avatar FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    const rawImage = profile?.og_image || profile?.avatar || '';

    // 1. Jika sudah berupa URL publik (https://...)
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return Response.redirect(rawImage, 302);
    }

    // 2. Jika berupa Base64 (data:image/...) -> Konversi ke biner gambar asli di Edge
    const cleanData = rawImage.trim();
    const commaIndex = cleanData.indexOf(',');

    if (cleanData.startsWith('data:image/') && commaIndex !== -1) {
      const header = cleanData.substring(0, commaIndex);
      const base64Data = cleanData.substring(commaIndex + 1);
      const mimeType = header.split(';')[0].replace('data:', '') || 'image/jpeg';
      
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 3. Fallback jika profil belum memiliki gambar banner
    return Response.redirect(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=630&fit=crop',
      302
    );

  } catch (err) {
    return new Response('Failed to render OG image: ' + err.message, { status: 500 });
  }
}