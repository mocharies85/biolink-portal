// functions/_middleware.js

// Helper untuk membersihkan karakter khusus agar tag HTML valid
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Abaikan API, asset Next.js, file statis (gambar/ikon), dan rute sistem
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    ['/admin', '/login', '/register', '/404'].includes(pathname.toLowerCase())
  ) {
    return next();
  }

  // 2. Ambil username dari segmen path URL (misal: /vanth -> vanth)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) {
    return next();
  }

  const username = segments[0].toLowerCase();

  try {
    // 3. Periksa apakah profil ada di database D1
    const profile = await env.DB.prepare(
      'SELECT name, tagline, bio, avatar, og_title, og_description, og_image FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    // Jika username tidak terdaftar di database, lanjutkan penanganan bawaan
    if (!profile) {
      return next();
    }

    // 4. Ambil response halaman
    let response = await next();

    // Jika halaman mengembalikan 404 (karena mode static export Next.js belum meng-generate file user bersangkutan),
    // ambil template HTML yang sudah ada dan ubah statusnya menjadi 200 OK agar bot medsos bersedia memprosesnya
    if (response.status === 404 && env.ASSETS) {
      const templateReq = new Request(new URL('/aries', request.url), request);
      const templateRes = await env.ASSETS.fetch(templateReq);
      
      response = new Response(templateRes.body, {
        status: 200,
        headers: templateRes.headers
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    // 5. Susun konten OpenGraph & Twitter Card
    const cardTitle = profile.og_title?.trim() || profile.name || `@${username} | Curiolot Link`;
    const cardDesc = profile.og_description?.trim() || profile.bio || profile.tagline || `Explore portfolio, links, and updates from @${username}.`;
    const cardImage = profile.og_image?.trim() || profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

    // 6. Suntikkan meta tag ke dalam <head> menggunakan HTMLRewriter bawaan Cloudflare
    return new HTMLRewriter()
      .on('title', {
        element(e) {
          e.setInnerContent(escapeHtml(cardTitle));
        }
      })
      .on('head', {
        element(e) {
          e.append(`\n  <!-- Dynamic OpenGraph Injected by Cloudflare Edge -->\n`, { html: true });
          e.append(`  <meta property="og:type" content="profile" />\n`, { html: true });
          e.append(`  <meta property="og:title" content="${escapeHtml(cardTitle)}" />\n`, { html: true });
          e.append(`  <meta property="og:description" content="${escapeHtml(cardDesc)}" />\n`, { html: true });
          e.append(`  <meta property="og:image" content="${escapeHtml(cardImage)}" />\n`, { html: true });
          e.append(`  <meta property="og:url" content="${escapeHtml(url.href)}" />\n`, { html: true });
          
          e.append(`  <meta name="twitter:card" content="summary_large_image" />\n`, { html: true });
          e.append(`  <meta name="twitter:title" content="${escapeHtml(cardTitle)}" />\n`, { html: true });
          e.append(`  <meta name="twitter:description" content="${escapeHtml(cardDesc)}" />\n`, { html: true });
          e.append(`  <meta name="twitter:image" content="${escapeHtml(cardImage)}" />\n`, { html: true });
        }
      })
      .transform(response);

  } catch (err) {
    console.error('Edge social card injection failed:', err);
    return next();
  }
}