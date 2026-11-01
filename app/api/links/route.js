// In-memory rate limiter for PIN brute force protection
const pinRateLimitMap = new Map();

// GET: Fetch links belonging to a specific username (?username=aries)
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get('username') || 'aries').trim().toLowerCase();
    const isAdmin = url.searchParams.get('admin') === 'true' || url.searchParams.get('all') === 'true';

    // Order by sort_order ascending, fallback to id ascending
    const { results } = await env.DB.prepare(
      'SELECT * FROM user_links WHERE LOWER(username) = ? ORDER BY sort_order ASC, id ASC'
    ).bind(username).all();

    // Fetch user PRO status
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(username).first();

    const isPro = user ? user.is_pro === 1 : false;
    const now = new Date();

    // Filter links by schedule and protect PIN for public visitors
    const links = (results || []).filter((link) => {
      if (isAdmin) return true;

      // Section header is always visible
      if (link.is_header === 1) return true;

      // Filter schedule start
      if (link.schedule_start && new Date(link.schedule_start) > now) {
        return false;
      }

      // Filter schedule expiration
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

      const hasPin = Boolean(link.pin_code && String(link.pin_code).trim().length > 0);
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
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST: Add new link/header or verify PIN
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // 1. PIN verification for public profile visitors with anti-brute force
    if (data.action === 'verify_pin') {
      const { linkId, pin } = data;
      if (!linkId || pin === undefined || pin === null || !String(pin).trim()) {
        return new Response(JSON.stringify({ error: 'PIN code is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown-client';
      const rateLimitKey = `${clientIp}_${linkId}`;
      const now = Date.now();
      const record = pinRateLimitMap.get(rateLimitKey) || { failedAttempts: 0, lockedUntil: 0 };

      // Check temporary lockout
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

      if (storedPin && storedPin === enteredPin) {
        pinRateLimitMap.delete(rateLimitKey);
        await env.DB.prepare('UPDATE user_links SET clicks = clicks + 1 WHERE id = ?').bind(linkId).run();

        return new Response(JSON.stringify({ success: true, url: item.url }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      record.failedAttempts += 1;
      if (record.failedAttempts >= 5) {
        record.lockedUntil = now + 5 * 60 * 1000; // 5-minute lockout
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

    // 2. Add New Link or Section Header
    const {
      username,
      title,
      url: linkUrl,
      description,
      is_header,
      is_spotlight,
      schedule_start,
      schedule_end,
      pin_code
    } = data;

    if (!username || !String(username).trim()) {
      return new Response(JSON.stringify({ error: 'Username is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!title || !String(title).trim()) {
      return new Response(JSON.stringify({ error: 'Title is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check user PRO status
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    const isPro = user ? user.is_pro === 1 : false;

    // Free tier limitation (max 3 links, headers excluded)
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

    // Determine next order
    const maxOrderRow = await env.DB.prepare(
      'SELECT MAX(sort_order) as max_order FROM user_links WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();

    const nextOrder = maxOrderRow && maxOrderRow.max_order !== null ? maxOrderRow.max_order + 1 : 0;

    // PRO-exclusive features
    const spotlightValue = !is_header && isPro && is_spotlight ? 1 : 0;
    const scheduleStartVal = !is_header && isPro && schedule_start ? schedule_start : null;
    const scheduleEndVal = !is_header && isPro && schedule_end ? schedule_end : null;
    const pinCodeVal = !is_header && isPro && pin_code && String(pin_code).trim() ? String(pin_code).trim() : null;

    // Insert into user_links table
    await env.DB.prepare(
      `INSERT INTO user_links (
        username, title, url, description, is_spotlight, schedule_start, schedule_end, pin_code, is_header, sort_order, clicks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).bind(
      cleanUsername, 
      String(title).trim(), 
      is_header ? '' : (linkUrl ? String(linkUrl).trim() : ''), 
      is_header ? '' : (description ? String(description).trim() : ''), 
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
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT: Save reordered links & headers
export async function onRequestPut({ request, env }) {
  try {
    const { username, orderedIds } = await request.json();

    if (!username || !Array.isArray(orderedIds)) {
      return new Response(JSON.stringify({ error: 'Invalid payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

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
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PATCH: Edit link attributes, spotlight, and PRO features
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

    const cleanUsername = String(username).trim().toLowerCase();

    // Check existing link
    const existing = await env.DB.prepare(
      'SELECT * FROM user_links WHERE id = ? AND LOWER(username) = ?'
    ).bind(id, cleanUsername).first();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Link not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check user PRO status
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = ?'
    ).bind(cleanUsername).first();
    const isPro = user ? user.is_pro === 1 : false;

    // Nilai teks aman dari null / undefined
    const newTitle = title !== undefined && title !== null ? String(title).trim() : existing.title;
    const newUrl = existing.is_header ? '' : (linkUrl !== undefined && linkUrl !== null ? String(linkUrl).trim() : (existing.url || ''));
    const newDesc = existing.is_header ? '' : (description !== undefined && description !== null ? String(description).trim() : (existing.description || ''));

    // PRO attributes
    const newSpotlight = isPro && is_spotlight !== undefined ? (is_spotlight ? 1 : 0) : existing.is_spotlight;
    const newStart = isPro && schedule_start !== undefined ? (schedule_start || null) : existing.schedule_start;
    const newEnd = isPro && schedule_end !== undefined ? (schedule_end || null) : existing.schedule_end;

    // PIN aman: jika string kosong atau null, simpan sebagai null di database
    const newPin = isPro && pin_code !== undefined
      ? (pin_code && String(pin_code).trim() ? String(pin_code).trim() : null)
      : existing.pin_code;

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
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Delete link with username ownership verification
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
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}