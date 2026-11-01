// functions/api/mediakit.js

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username')?.toLowerCase()?.trim();

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Ambil data media kit dari D1 database
    const stmt = env.DB.prepare(
      'SELECT mediakit_data FROM users WHERE LOWER(username) = ? LIMIT 1'
    );
    const user = await stmt.bind(username).first();

    if (!user || !user.mediakit_data) {
      // Return data default jika belum pernah disimpan
      return new Response(
        JSON.stringify({
          mediakit: null,
          message: 'No custom media kit found, using defaults.',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsedData = JSON.parse(user.mediakit_data);
    return new Response(JSON.stringify({ mediakit: parsedData }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database query failed: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { username, mediaKitData } = body;

    if (!username || !mediaKitData) {
      return new Response(JSON.stringify({ error: 'Missing username or media kit data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jsonString = JSON.stringify(mediaKitData);

    // Simpan ke kolom mediakit_data pada tabel users
    await env.DB.prepare(
      'UPDATE users SET mediakit_data = ? WHERE LOWER(username) = ?'
    ).bind(jsonString, username.toLowerCase().trim()).run();

    return new Response(
      JSON.stringify({ success: true, message: 'Media Kit saved successfully!' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to save media kit: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}