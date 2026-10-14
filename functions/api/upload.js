// functions/api/upload.js

const R2_PUBLIC_DOMAIN = 'https://pub-03954241d17049f68a96483276f13d3b.r2.dev';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.BUCKET) {
      return new Response(JSON.stringify({ error: 'R2 BUCKET binding not found. Please check Cloudflare Settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const username = formData.get('username') || 'creator';

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No valid file provided' }), { status: 400 });
    }

    // Buat nama file unik dan aman
    const ext = file.name.split('.').pop() || 'mp4';
    const cleanName = `${username}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // Simpan file langsung ke Cloudflare R2
    await env.BUCKET.put(cleanName, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'video/mp4'
      }
    });

    const fileUrl = `${R2_PUBLIC_DOMAIN}/${cleanName}`;

    return new Response(JSON.stringify({ success: true, url: fileUrl }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}