export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    // Tambah nilai views +1
    await env.DB.prepare(
      `UPDATE profiles 
       SET views = COALESCE(views, 0) + 1 
       WHERE LOWER(username) = LOWER(?)`
    ).bind(username).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}