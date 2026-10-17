export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username')?.toLowerCase();

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Validasi status PRO pengguna di database D1
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(username).first();

    if (!user || user.is_pro !== 1) {
      return new Response(JSON.stringify({ error: 'Fitur ekspor CSV khusus untuk pengguna akun PRO.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Ambil seluruh data pesan masuk
    const { results } = await env.DB.prepare(
      'SELECT sender, content, created_at FROM messages WHERE LOWER(username) = ? ORDER BY id DESC'
    ).bind(username).all();

    // 3. Format isi tabel menjadi struktur CSV
    const headers = ['Date', 'Sender / Contact', 'Message Content'];
    const rows = (results || []).map((row) => {
      const date = row.created_at ? `"${new Date(row.created_at).toLocaleString()}"` : '""';
      const sender = `"${(row.sender || 'Anonymous').replace(/"/g, '""')}"`;
      const content = `"${(row.content || '').replace(/"/g, '""')}"`;
      return `${date},${sender},${content}`;
    });

    const csvData = [headers.join(','), ...rows].join('\n');

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inbox-${username}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}