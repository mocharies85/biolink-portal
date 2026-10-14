// functions/api/views.js

// Helper: Klasifikasi sumber trafik rujukan
function parseReferrer(rawRef) {
  if (!rawRef || typeof rawRef !== 'string') return 'Direct / Other';
  const ref = rawRef.toLowerCase();
  if (ref.includes('instagram.com') || ref.includes('ig.me')) return 'Instagram Bio';
  if (ref.includes('tiktok.com')) return 'TikTok Profile';
  if (ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('fb.me')) return 'Facebook';
  if (ref.includes('youtube.com') || ref.includes('youtu.be')) return 'YouTube';
  if (ref.includes('whatsapp.com') || ref.includes('wa.me')) return 'WhatsApp';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('threads.net')) return 'Threads';
  return 'Direct / Other';
}

// Helper: Deteksi tipe perangkat
function parseDevice(userAgent, clientDevice) {
  if (clientDevice && (clientDevice === 'mobile' || clientDevice === 'desktop')) {
    return clientDevice;
  }
  if (!userAgent) return 'desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

// 1. GET: Ambil data analitik riil (Breakdown Devices & Referrers) atau total views
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const isAnalytics = url.searchParams.get('analytics') === 'true';

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    // Buat tabel analytics_events secara otomatis di D1 jika belum ada
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        device TEXT NOT NULL,
        referrer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    if (isAnalytics) {
      // Hitung total log kunjungan
      const totalRes = await env.DB.prepare(`
        SELECT COUNT(*) as total FROM analytics_events WHERE LOWER(username) = LOWER(?)
      `).bind(username).first();
      const totalVisits = totalRes?.total || 0;

      // Hitung persentase perangkat (Mobile vs Desktop)
      const { results: deviceRows } = await env.DB.prepare(`
        SELECT device, COUNT(*) as count 
        FROM analytics_events 
        WHERE LOWER(username) = LOWER(?) 
        GROUP BY device
      `).bind(username).all();

      let mobileCount = 0;
      let desktopCount = 0;
      for (const d of (deviceRows || [])) {
        if (d.device === 'mobile') mobileCount = d.count;
        if (d.device === 'desktop') desktopCount = d.count;
      }

      const mobilePct = totalVisits > 0 ? Math.round((mobileCount / totalVisits) * 100) : 0;
      const desktopPct = totalVisits > 0 ? 100 - mobilePct : 0;

      // Hitung persentase sumber trafik (Top Referrers)
      const { results: refRows } = await env.DB.prepare(`
        SELECT referrer, COUNT(*) as count 
        FROM analytics_events 
        WHERE LOWER(username) = LOWER(?) 
        GROUP BY referrer 
        ORDER BY count DESC
      `).bind(username).all();

      const referrers = (refRows || []).map((r) => ({
        source: r.referrer,
        count: r.count,
        percentage: totalVisits > 0 ? Math.round((r.count / totalVisits) * 100) : 0
      }));

      return new Response(JSON.stringify({
        totalVisits,
        devices: {
          mobilePct,
          desktopPct,
          mobileCount,
          desktopCount
        },
        referrers
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default: kembalikan total views profil dari user_profiles
    const profile = await env.DB.prepare(`
      SELECT COALESCE(views, 0) as views FROM user_profiles WHERE LOWER(username) = LOWER(?)
    `).bind(username).first();

    return new Response(JSON.stringify({ views: profile?.views || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. POST: Rekam data riil saat pengunjung membuka profil bio
export async function onRequestPost({ request, env }) {
  try {
    let username = '';
    let clientReferrer = '';
    let clientDevice = '';

    const url = new URL(request.url);
    const paramUsername = url.searchParams.get('username');

    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        username = body.username || paramUsername;
        clientReferrer = body.referrer || '';
        clientDevice = body.device || '';
      } catch {}
    } else {
      username = paramUsername;
      clientReferrer = url.searchParams.get('referrer') || '';
      clientDevice = url.searchParams.get('device') || '';
    }

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
    }

    // Tentukan sumber rujukan dan perangkat
    const rawRef = clientReferrer || request.headers.get('referer') || '';
    const resolvedReferrer = parseReferrer(rawRef);

    const userAgent = request.headers.get('user-agent') || '';
    const resolvedDevice = parseDevice(userAgent, clientDevice);

    // Buat tabel jika belum ada
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        device TEXT NOT NULL,
        referrer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Simpan event analitik riil dan naikkan counter views profil
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO analytics_events (username, device, referrer) 
        VALUES (LOWER(?), ?, ?)
      `).bind(username, resolvedDevice, resolvedReferrer),
      env.DB.prepare(`
        UPDATE user_profiles 
        SET views = COALESCE(views, 0) + 1 
        WHERE LOWER(username) = LOWER(?)
      `).bind(username)
    ]);

    return new Response(JSON.stringify({ success: true, device: resolvedDevice, referrer: resolvedReferrer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}