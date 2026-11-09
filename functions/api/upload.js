// functions/api/upload.js

const STORIES_PUBLIC_DOMAIN = 'https://pub-03954241d17049f68a96483276f13d3b.r2.dev';
const MEDIA_PUBLIC_DOMAIN = 'https://pub-af30dd30344d4c978a0b58579942823d.r2.dev';

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const username = formData.get('username') || 'creator';
    const folder = formData.get('folder') || ''; // 'media' atau 'story'

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No valid file provided' }), { status: 400 });
    }

    const fileType = file.type || '';
    const isVideo = fileType.startsWith('video/') || folder === 'story';
    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const cleanName = `${username}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 1. Jika video/story -> simpan ke BUCKET (curiolot-stories)
    if (isVideo) {
      if (!env.BUCKET) {
        return new Response(JSON.stringify({ error: 'R2 BUCKET binding not found.' }), { status: 500 });
      }

      await env.BUCKET.put(cleanName, file.stream(), {
        httpMetadata: { contentType: fileType || 'video/mp4' }
      });

      return new Response(
        JSON.stringify({ success: true, url: `${STORIES_PUBLIC_DOMAIN}/${cleanName}` }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Jika gambar (avatar, cover produk, banner) -> simpan ke MEDIA_BUCKET (curiolot-media)
    const targetBucket = env.MEDIA_BUCKET || env.BUCKET;
    const targetDomain = env.MEDIA_BUCKET ? MEDIA_PUBLIC_DOMAIN : STORIES_PUBLIC_DOMAIN;

    await targetBucket.put(cleanName, file.stream(), {
      httpMetadata: { contentType: fileType || 'image/jpeg' }
    });

    const fileUrl = `${targetDomain}/${cleanName}`;

    return new Response(
      JSON.stringify({ success: true, url: fileUrl }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}