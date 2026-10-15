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

  // Abaikan API, asset Next.js, file statis, dan rute dasbor
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    ['/admin', '/login', '/register', '/404'].includes(pathname.toLowerCase())
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
    
    // Gunakan URL endpoint API publik agar bot perayap media sosial dapat mengunduhnya secara valid
    const cardImageUrl = `${url.origin}/api/og-image?username=${encodeURIComponent(username)}`;

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
          e.append(`  <meta property="og:type" content="profile" />\n`, { html: true });
          e.append(`  <meta property="og:title" content="${escapeHtml(cardTitle)}" />\n`, { html: true });
          e.append(`  <meta property="og:description" content="${escapeHtml(cardDesc)}" />\n`, { html: true });
          e.append(`  <meta property="og:image" content="${escapeHtml(cardImageUrl)}" />\n`, { html: true });
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