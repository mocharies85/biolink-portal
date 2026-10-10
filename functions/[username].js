export async function onRequest({ request, env, params }) {
  const username = params.username ? params.username.toLowerCase() : '';

  // Daftar rute sistem yang tidak boleh dialihkan ke profil bio
  const reservedRoutes = [
    'register',
    'login',
    'admin',
    'superadmin',
    'api',
    '_next',
    'favicon.ico',
    'forgot-password',
    'reset-password',
  ];

  // Jika URL adalah rute sistem atau file statis, sajikan halaman aslinya
  if (!username || reservedRoutes.includes(username) || username.includes('.')) {
    return env.ASSETS.fetch(request);
  }

  // Jika URL adalah username dinamis (seperti /vant, /alex), gunakan template bio
  const url = new URL(request.url);
  url.pathname = '/aries';
  const template = await env.ASSETS.fetch(new Request(url.toString(), request));

  return new Response(template.body, {
    headers: template.headers,
    status: 200,
  });
}