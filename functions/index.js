// functions/index.js

export async function onRequest({ request, env }) {
  const response = await env.ASSETS.fetch(request);
  
  // Ambil pengaturan SEO terbaru dari database D1
  let seoTitle = 'Curiolot Link — Claim Your Rare Vanity Handle';
  let seoDesc = 'Rare 1-word handles are still wide open. Showcase your work with 24h stories & soundtracks.';
  let seoImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop';

  try {
    const { results } = await env.DB.prepare(
      `SELECT key, value FROM site_settings WHERE key IN ('seo_title', 'seo_description', 'seo_image')`
    ).all();

    (results || []).forEach(row => {
      if (row.key === 'seo_title' && row.value) seoTitle = row.value;
      if (row.key === 'seo_description' && row.value) seoDesc = row.value;
      if (row.key === 'seo_image' && row.value) seoImage = row.value;
    });
  } catch {}

  const metaHtml = `
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDesc}" />

    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://link.curiolot.com" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${seoDesc}" />
    <meta property="og:image" content="${seoImage}" />

    <!-- Twitter / X Summary Large Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Curiolot" />
    <meta name="twitter:url" content="https://link.curiolot.com" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${seoDesc}" />
    <meta name="twitter:image" content="${seoImage}" />
  `;

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append(metaHtml, { html: true });
      }
    })
    .transform(response);
}