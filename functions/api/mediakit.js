export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const row = await env.DB.prepare(
      'SELECT * FROM media_kits WHERE username = ?'
    ).bind(username).first();

    if (!row) {
      return new Response(JSON.stringify({ mediakit: null }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mediakit = {
      is_enabled: row.is_enabled === 1 || row.is_enabled === true,
      headline: row.headline || '',
      about: row.about || '',
      contact_email: row.contact_email || '',
      total_followers: row.total_followers || 0,
      monthly_impressions: row.monthly_impressions || 0,
      engagement_rate: row.engagement_rate || 0,
      primary_niche: row.primary_niche || '',
      audience_country: row.audience_country || '',
      rate_cards: typeof row.packages === 'string' ? JSON.parse(row.packages) : (row.rate_cards || []),
    };

    return new Response(JSON.stringify({ mediakit }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const username = data.username;
    const kit = data.mediaKitData || data;

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isEnabled = kit.is_enabled ? 1 : 0;
    const rateCards = JSON.stringify(kit.rate_cards || []);

    await env.DB.prepare(`
      INSERT INTO media_kits (
        username, is_enabled, headline, about, contact_email, 
        total_followers, monthly_impressions, engagement_rate, 
        primary_niche, audience_country, packages, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        is_enabled = excluded.is_enabled,
        headline = excluded.headline,
        about = excluded.about,
        contact_email = excluded.contact_email,
        total_followers = excluded.total_followers,
        monthly_impressions = excluded.monthly_impressions,
        engagement_rate = excluded.engagement_rate,
        primary_niche = excluded.primary_niche,
        audience_country = excluded.audience_country,
        packages = excluded.packages,
        updated_at = excluded.updated_at
    `).bind(
      username,
      isEnabled,
      kit.headline || '',
      kit.about || '',
      kit.contact_email || '',
      kit.total_followers || 0,
      kit.monthly_impressions || 0,
      kit.engagement_rate || 0,
      kit.primary_niche || '',
      kit.audience_country || '',
      rateCards,
      Date.now()
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}