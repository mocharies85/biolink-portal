// GET: Mengambil daftar Brand Deals untuk dashboard admin
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM brand_deals WHERE LOWER(username) = LOWER(?) ORDER BY created_at DESC'
    ).bind(username.trim()).all();

    const formattedDeals = (results || []).map((deal) => ({
      ...deal,
      selected_packages: typeof deal.selected_packages === 'string'
        ? JSON.parse(deal.selected_packages || '[]')
        : (deal.selected_packages || []),
    }));

    return new Response(JSON.stringify({ deals: formattedDeals }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST: Menerima pengajuan tawaran dari formulir publik Media Kit
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const {
      username,
      brand_name,
      contact_name,
      contact_email,
      selected_packages,
      total_budget,
      campaign_brief,
      target_date,
    } = data;

    if (!username || !brand_name || !contact_email) {
      return new Response(
        JSON.stringify({ error: 'Brand name, contact email, and creator username are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dealId = 'deal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const packagesJson = JSON.stringify(selected_packages || []);

    await env.DB.prepare(`
      INSERT INTO brand_deals (
        id, username, brand_name, contact_name, contact_email,
        selected_packages, total_budget, campaign_brief, target_date, status, created_at
      ) VALUES (?, LOWER(?), ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      dealId,
      username.trim(),
      brand_name.trim(),
      contact_name ? contact_name.trim() : '',
      contact_email.trim().toLowerCase(),
      packagesJson,
      Number(total_budget) || 0,
      campaign_brief ? campaign_brief.trim() : '',
      target_date || '',
      Date.now()
    ).run();

    return new Response(
      JSON.stringify({ success: true, message: 'Brand deal submitted successfully!', dealId }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PATCH: Memperbarui status tawaran (pending / accepted / declined)
export async function onRequestPatch({ request, env }) {
  try {
    const { dealId, status } = await request.json();

    if (!dealId || !['pending', 'accepted', 'declined'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Valid dealId and status are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      'UPDATE brand_deals SET status = ? WHERE id = ?'
    ).bind(status, dealId).run();

    return new Response(JSON.stringify({ success: true, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}