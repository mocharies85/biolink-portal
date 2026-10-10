export async function onRequest({ request, env, params }) {
  const username = params.username;

  // Abaikan request API atau file statis (gambar, icon, script)
  if (!username || username.startsWith('api') || username.includes('.')) {
    return env.ASSETS.fetch(request);
  }

  // Alihkan permintaan halaman ke template bio secara dinamis
  const url = new URL(request.url);
  url.pathname = '/aries';
  const template = await env.ASSETS.fetch(new Request(url.toString(), request));

  return new Response(template.body, {
    headers: template.headers,
    status: 200,
  });
}