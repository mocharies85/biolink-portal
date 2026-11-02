// GET: Retrieve digital products
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  const forAdmin = url.searchParams.get('admin') === 'true';

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let query = 'SELECT * FROM products WHERE LOWER(username) = LOWER(?)';
    if (!forAdmin) {
      query += ' AND is_active = 1';
    }
    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query)
      .bind(username.trim())
      .all();

    // Sanitize sensitive fields for public requests
    const sanitized = (results || []).map((item) => {
      if (!forAdmin) {
        const { pin_code, file_url, ...rest } = item;
        const isLocked = item.access_type === 'pin_lock';
        return {
          ...rest,
          // Conceal download URL for PIN-locked items until verified
          file_url: isLocked ? '' : file_url,
          is_locked: isLocked,
          has_pin: Boolean(pin_code && pin_code.trim().length > 0),
        };
      }
      return item;
    });

    return new Response(JSON.stringify({ products: sanitized }), {
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

// POST: Create digital drops or verify PIN unlock
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // 1. Action: Unlock PIN-protected digital drop for public visitors
    if (data.action === 'unlock_pin') {
      const { productId, pin } = data;
      if (!productId || !pin) {
        return new Response(
          JSON.stringify({ error: 'Product ID and PIN passcode are required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const product = await env.DB.prepare(
        'SELECT file_url, pin_code FROM products WHERE id = ? AND is_active = 1'
      )
        .bind(productId)
        .first();

      if (!product) {
        return new Response(
          JSON.stringify({ error: 'Product not found or currently inactive.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (
        product.pin_code &&
        product.pin_code.trim().toLowerCase() === pin.trim().toLowerCase()
      ) {
        // Increment download counter upon successful unlock
        await env.DB.prepare(
          'UPDATE products SET downloads_count = downloads_count + 1 WHERE id = ?'
        )
          .bind(productId)
          .run();

        return new Response(
          JSON.stringify({ success: true, file_url: product.file_url }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid PIN passcode. Please try again.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Action: Create new digital drop (Creator Admin)
    const {
      username,
      title,
      description,
      price,
      category,
      access_type,
      pin_code,
      cover_image,
      file_url,
      button_text,
    } = data;

    if (!username || !title || !file_url) {
      return new Response(
        JSON.stringify({ error: 'Username, title, and target/download URL are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify creator tier (Free vs PRO)
    const user = await env.DB.prepare(
      'SELECT is_pro FROM users WHERE LOWER(username) = LOWER(?)'
    )
      .bind(username.trim())
      .first();

    const isPro = user && (user.is_pro === 1 || user.is_pro === true);

    // Enforce 2-drop limitation for Free tier
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM products WHERE LOWER(username) = LOWER(?)'
    )
      .bind(username.trim())
      .first();

    const currentTotal = countResult?.total || 0;

    if (!isPro && currentTotal >= 2) {
      return new Response(
        JSON.stringify({
          error: 'Free plan is limited to 2 digital products. Upgrade to PRO for unlimited drops.',
          upgrade_required: true,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Restrict PIN lock fulfillment to PRO creators
    if (access_type === 'pin_lock' && !isPro) {
      return new Response(
        JSON.stringify({
          error: 'PIN-Protected VIP drops are exclusive to PRO creators.',
          upgrade_required: true,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const productId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    await env.DB.prepare(`
      INSERT INTO products (
        id, username, title, description, price, category, access_type, pin_code, cover_image, file_url, button_text, is_active, downloads_count, created_at
      ) VALUES (?, LOWER(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
    `)
      .bind(
        productId,
        username.trim(),
        title.trim(),
        description ? description.trim() : '',
        Number(price) || 0,
        category || 'Digital Asset',
        access_type || 'direct',
        pin_code ? pin_code.trim() : null,
        cover_image || '',
        file_url.trim(),
        button_text || (Number(price) > 0 ? 'Buy & Download' : 'Download Now'),
        Date.now()
      )
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Digital drop created successfully!', productId }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PATCH: Toggle visibility or edit product details
export async function onRequestPatch({ request, env }) {
  try {
    const data = await request.json();
    const { id, is_active, title, price, description, file_url, cover_image } = data;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (is_active !== undefined) {
      await env.DB.prepare('UPDATE products SET is_active = ? WHERE id = ?')
        .bind(is_active ? 1 : 0, id)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(`
      UPDATE products SET 
        title = COALESCE(?, title),
        price = COALESCE(?, price),
        description = COALESCE(?, description),
        file_url = COALESCE(?, file_url),
        cover_image = COALESCE(?, cover_image)
      WHERE id = ?
    `)
      .bind(title, price, description, file_url, cover_image, id)
      .run();

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

// DELETE: Remove digital product
export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Product ID is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
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