// Mengambil link milik username tertentu (?username=aries)
    const pinRateLimitMap = new Map();
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get('username') || 'aries').trim().toLowerCase();
    const isAdmin = url.searchParams.get('admin') === 'true' || url.searchParams.get('all') === 'true';

    // Urutkan berdasarkan sort_order terkecil ke terbesar, lalu fallback ke id ASC
    const { results } = await env.DB.prepare(
      'SELECT * FROM user_links WHERE LOWER(username) = ? ORDER BY sort_order ASC, id ASC'
    ).bind(username).all();

    // Ambil status is_pro pengguna
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(username).first();

    const isPro = user ? user.is_pro === 1 : false;
    const now = new Date();

    // Saring tautan berdasarkan jadwal dan amankan PIN untuk pengunjung publik
    const links = (results || []).filter((link) => {
      if (isAdmin) return true;

      // Section header selalu ditampilkan
      if (link.is_header === 1) return true;

      // Saring jadwal mulai tampil
      if (link.schedule_start && new Date(link.schedule_start) > now) {
        return false;
      }

      // Saring batas kedaluwarsa link
      if (link.schedule_end && new Date(link.schedule_end) < now) {
        return false;
      }

      return true;
    }).map((link) => {
      if (isAdmin) return link;

      if (link.is_header === 1) {
        return {
          ...link,
          has_pin: false,
          url: '',
          pin_code: undefined,
        };
      }

      const hasPin = Boolean(link.pin_code && link.pin_code.trim().length > 0);
      return {
        ...link,
        has_pin: hasPin,
        url: hasPin ? '' : link.url,
        pin_code: undefined,
      };
    });

    return new Response(
      JSON.stringify({ 
        links, 
        isPro 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Menambah link atau section header baru
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Verifikasi kode PIN untuk pengunjung halaman publik dengan Anti-Brute Force
    if (data.action === 'verify_pin') {
      const { linkId, pin } = data;
      if (!linkId || !pin || !pin.trim()) {
        return new Response(JSON.stringify({ error: 'PIN code is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown-client';
      const rateLimitKey = `${clientIp}_${linkId}`;
      const now = Date.now();
      const record = pinRateLimitMap.get(rateLimitKey) || { failedAttempts: 0, lockedUntil: 0 };

      // 1. Cek apakah IP sedang terkunci sementara
      if (record.lockedUntil > now) {
        const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
        return new Response(
          JSON.stringify({
            error: `Too many failed attempts. Try again in ${waitSeconds}s.`
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const item = await env.DB.prepare(
        'SELECT url, pin_code FROM user_links WHERE id = ?'
      ).bind(linkId).first();

      if (!item) {
        return new Response(JSON.stringify({ error: 'Link not found.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const storedPin = String(item.pin_code || '').trim();
      const enteredPin = String(pin).trim();

      // 2. Jika PIN Cocok
      if (storedPin && storedPin === enteredPin) {
        // Reset riwayat kegagalan
        pinRateLimitMap.delete(rateLimitKey);

        // Hitung statistik klik saat PIN berhasil terbuka
        await env.DB.prepare('UPDATE user_links SET clicks = clicks + 1 WHERE id = ?').bind(linkId).run();

        return new Response(JSON.stringify({ success: true, url: item.url }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 3. Jika PIN Salah -> Tambah counter kegagalan
      record.failedAttempts += 1;

      // Kunci selama 5 menit jika salah 5 kali berturut-turut
      if (record.failedAttempts >= 5) {
        record.lockedUntil = now + 5 * 60 * 1000;
        record.failedAttempts = 0;
        pinRateLimitMap.set(rateLimitKey, record);

        return new Response(
          JSON.stringify({
            error: 'Too many incorrect attempts. Access locked for 5 minutes.'
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      pinRateLimitMap.set(rateLimitKey, record);
      const remainingAttempts = 5 - record.failedAttempts;

      return new Response(
        JSON.stringify({
          error: `Invalid PIN code. ${remainingAttempts} attempt(s) remaining.`
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    
    const cleanUsername = username.trim().toLowerCase();

    // 1. Cek status is_pro pengguna di database
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    const isPro = user ? user.is_pro === 1 : false;

    // 2. Batasi pengguna non-PRO maksimal 3 link (Section header tidak memotong kuota link)
    if (!isPro && !is_header) {
      const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as total FROM user_links WHERE LOWER(username) = ? AND is_header = 0'
      ).bind(cleanUsername).first();

      const totalLinks = countResult ? countResult.total : 0;

      if (totalLinks >= 3) {
        return new Response(
          JSON.stringify({ 
            error: 'Free tier limit reached (max 3 links). Upgrade to PRO for unlimited links!' 
          }), 
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 3. Tentukan nilai urutan berikutnya agar item baru otomatis ditaruh di paling bawah
    const maxOrderRow = await env.DB.prepare(
      'SELECT MAX(sort_order) as max_order FROM user_links WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    const nextOrder = maxOrderRow && maxOrderRow.max_order !== null ? maxOrderRow.max_order + 1 : 0;

    // Fitur Smart Links eksklusif untuk akun PRO dan link standar
    const spotlightValue = !is_header && isPro && is_spotlight ? 1 : 0;
    const scheduleStartVal = !is_header && isPro && schedule_start ? schedule_start : null;
    const scheduleEndVal = !is_header && isPro && schedule_end ? schedule_end : null;
    const pinCodeVal = !is_header && isPro && pin_code ? pin_code.trim() : null;

    // 4. Simpan ke tabel user_links
    await env.DB.prepare(
      `INSERT INTO user_links (
        username, title, url, description, is_spotlight, schedule_start, schedule_end, pin_code, is_header, sort_order, clicks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).bind(
      cleanUsername, 
      title.trim(), 
      is_header ? '' : linkUrl.trim(), 
      is_header ? '' : (description?.trim() || ''), 
      spotlightValue,
      scheduleStartVal,
      scheduleEndVal,
      pinCodeVal,
      is_header ? 1 : 0,
      nextOrder
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Menyimpan susunan urutan link & header baru
export async function onRequestPut({ request, env }) {
  try {
    const { username, orderedIds } = await request.json();

    if (!username || !Array.isArray(orderedIds)) {
      return new Response(JSON.stringify({ error: 'Invalid payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Buat statement batch untuk memperbarui sort_order tiap ID
    const statements = orderedIds.map((id, index) =>
      env.DB.prepare(
        'UPDATE user_links SET sort_order = ? WHERE id = ? AND LOWER(username) = ?'
      ).bind(index, id, cleanUsername)
    );

    await env.DB.batch(statements);

    return new Response(JSON.stringify({ success: true }), {
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

// Mengubah status Spotlight link dan atribut Smart Links (Khusus Akun PRO)
export async function onRequestPatch({ request, env }) {
  try {
    const data = await request.json();
    const { id, username, title, url: linkUrl, description, is_spotlight, schedule_start, schedule_end, pin_code } = data;

    if (!id || !username) {
      return new Response(JSON.stringify({ error: 'Missing link ID or username.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Cek data existing
    const existing = await env.DB.prepare(
      'SELECT * FROM user_links WHERE id = ? AND LOWER(username) = ?'
    ).bind(id, cleanUsername).first();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Link tidak ditemukan.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Cek status akun PRO
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();
    const isPro = user ? user.is_pro === 1 : false;

    // Siapkan nilai baru (fallback ke data lama jika tidak diubah)
    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newUrl = existing.is_header ? '' : (linkUrl !== undefined ? linkUrl.trim() : existing.url);
    const newDesc = existing.is_header ? '' : (description !== undefined ? description.trim() : existing.description);
    
    // Fitur PRO: Spotlight, Jadwal, dan PIN
    const newSpotlight = isPro && is_spotlight !== undefined ? (is_spotlight ? 1 : 0) : existing.is_spotlight;
    const newStart = isPro && schedule_start !== undefined ? (schedule_start || null) : existing.schedule_start;
    const newEnd = isPro && schedule_end !== undefined ? (schedule_end || null) : existing.schedule_end;
    const newPin = isPro && pin_code !== undefined ? (pin_code.trim() || null) : existing.pin_code;

    await env.DB.prepare(`
      UPDATE user_links 
      SET 
        title = ?, 
        url = ?, 
        description = ?, 
        is_spotlight = ?, 
        schedule_start = ?, 
        schedule_end = ?, 
        pin_code = ?
      WHERE id = ? AND LOWER(username) = ?
    `).bind(
      newTitle,
      newUrl,
      newDesc,
      newSpotlight,
      newStart,
      newEnd,
      newPin,
      id,
      cleanUsername
    ).run();

    return new Response(JSON.stringify({ success: true }), {
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

// Menghapus link dengan validasi kepemilikan username
export async function onRequestDelete({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const username = (url.searchParams.get('username') || '').trim().toLowerCase();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing link ID.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (username) {
      await env.DB.prepare('DELETE FROM user_links WHERE id = ? AND LOWER(username) = ?').bind(id, username).run();
    } else {
      await env.DB.prepare('DELETE FROM user_links WHERE id = ?').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
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