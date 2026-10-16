// functions/api/admin/seo.js

export async function onRequestGet({ env }) {
  try {
    // Pastikan tabel site_settings sudah ada
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    const { results } = await env.DB.prepare(
      `SELECT key, value FROM site_settings WHERE key IN ('seo_title', 'seo_description', 'seo_image')`
    ).all();

    const settings = {
      seo_title: 'Curiolot Link — One Sleek Hub for All Your Work',
      seo_description: 'Claim your rare vanity handle. Showcase your links, projects, and 24h stories with music.',
      seo_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop'
    };

    (results || []).forEach(row => {
      settings[row.key] = row.value;
    });

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { seo_title, seo_description, seo_image } = await request.json();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    const stmt = env.DB.prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    );

    await env.DB.batch([
      stmt.bind('seo_title', seo_title || ''),
      stmt.bind('seo_description', seo_description || ''),
      stmt.bind('seo_image', seo_image || '')
    ]);

    return new Response(JSON.stringify({ success: true, message: 'SEO settings updated.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}