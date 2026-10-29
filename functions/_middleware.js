// functions/_middleware.js

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

  // 1. Tangani permintaan gambar langsung khusus WhatsApp/Telegram: /og-image/username.jpg
  if (pathname.startsWith('/og-image/')) {
    const filename = pathname.replace('/og-image/', '');
    const cleanUsername = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase();

    if (cleanUsername) {
      try {
        const profile = await env.DB.prepare(
          'SELECT og_image, avatar FROM user_profiles WHERE LOWER(username) = ?'
        ).bind(cleanUsername).first();

        const rawImage = profile?.og_image || profile?.avatar || '';

        if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
          return Response.redirect(rawImage, 302);
        }

        const cleanData = rawImage.trim();
        const commaIndex = cleanData.indexOf(',');

        if (cleanData.startsWith('data:image/') && commaIndex !== -1) {
          const base64Data = cleanData.substring(commaIndex + 1);
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          return new Response(bytes, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Content-Length': String(bytes.length),
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        return Response.redirect('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=630&fit=crop', 302);
      } catch (err) {
        return new Response('Error loading image', { status: 500 });
      }
    }
  }

  // 2. Abaikan API, asset Next.js, file statis, rute dashboard, dan halaman legal/pricing
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    [
      '/admin', 
      '/login', 
      '/register', 
      '/404', 
      '/pricing', 
      '/refund-policy', 
      '/terms', 
      '/privacy',
      '/forgot-password',
      '/reset-password',
      '/superadmin'
    ].includes(pathname.toLowerCase())
  ) {
    return next();
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) {
    return next();
  }

  const username = segments[0].toLowerCase();

  try {
    const profile = await env.DB.prepare(
      'SELECT name, tagline, bio, avatar, og_title, og_description, og_image FROM user_profiles WHERE LOWER(username) = ?'
    ).bind(username).first();

    if (!profile) {
      return next();
    }

    let response = await next();

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

    const cardTitle = profile.og_title?.trim() || profile.name || `@${username} | Curiolot Link`;
    const cardDesc = profile.og_description?.trim() || profile.bio || profile.tagline || `Explore portfolio, links, and updates from @${username}.`;
    
    // URL gambar berakhiran .jpg langsung tanpa tanda tanya agar ramah WhatsApp
    const cardImageUrl = `${url.origin}/og-image/${encodeURIComponent(username)}.jpg`;

    return new HTMLRewriter()
      .on('title', {
        element(e) {
          e.setInnerContent(escapeHtml(cardTitle));
        }
      })
      .on('head', {
        element(e) {
          e.append(`\n  <!-- Dynamic OpenGraph & Twitter Card Injected by Cloudflare Edge -->\n`, { html: true });
          e.append(`  <meta property="og:site_name" content="Curiolot Link" />\n`, { html: true });
          e.append(`  <meta property="og:type" content="website" />\n`, { html: true });
          e.append(`  <meta property="og:title" content="${escapeHtml(cardTitle)}" />\n`, { html: true });
          e.append(`  <meta property="og:description" content="${escapeHtml(cardDesc)}" />\n`, { html: true });
          e.append(`  <meta property="og:image" content="${escapeHtml(cardImageUrl)}" />\n`, { html: true });
          e.append(`  <meta property="og:image:secure_url" content="${escapeHtml(cardImageUrl)}" />\n`, { html: true });
          e.append(`  <meta property="og:image:type" content="image/jpeg" />\n`, { html: true });
          e.append(`  <meta property="og:image:width" content="1200" />\n`, { html: true });
          e.append(`  <meta property="og:image:height" content="630" />\n`, { html: true });
          e.append(`  <meta property="og:url" content="${escapeHtml(url.href)}" />\n`, { html: true });
          
          e.append(`  <meta name="twitter:card" content="summary_large_image" />\n`, { html: true });
          e.append(`  <meta name="twitter:title" content="${escapeHtml(cardTitle)}" />\n`, { html: true });
          e.append(`  <meta name="twitter:description" content="${escapeHtml(cardDesc)}" />\n`, { html: true });
          e.append(`  <meta name="twitter:image" content="${escapeHtml(cardImageUrl)}" />\n`, { html: true });
        }
      })
      .transform(response);

  } catch (err) {
    console.error('Edge social card injection failed:', err);
    return next();
  }
}