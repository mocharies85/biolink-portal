export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { userId, newUsername } = await request.json();

    // 1. Validasi format username (hanya huruf kecil, angka, underscore, dan strip, 3-20 karakter)
    const cleanUsername = String(newUsername || '').trim().toLowerCase();
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;

    if (!usernameRegex.test(cleanUsername)) {
      return new Response(JSON.stringify({ 
        error: "Username hanya boleh 3-20 karakter berupa huruf kecil, angka, '-' atau '_'." 
      }), { status: 400 });
    }

    // 2. Ambil data user saat ini
    const currentUser = await env.DB.prepare(
      "SELECT id, username, is_pro, last_username_change FROM users WHERE id = ?"
    ).bind(userId).first();

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User tidak ditemukan." }), { status: 404 });
    }

    if (currentUser.username === cleanUsername) {
      return new Response(JSON.stringify({ error: "Username baru tidak boleh sama dengan username saat ini." }), { status: 400 });
    }

    // 3. Cek pembatasan waktu (Cooldown 2x24 jam untuk user Free)
    const isPro = Boolean(currentUser.is_pro);
    const now = Date.now();
    const cooldownMs = 48 * 60 * 60 * 1000; // 48 jam
    const lastChange = currentUser.last_username_change || 0;

    if (!isPro && (now - lastChange) < cooldownMs) {
      const remainingHours = Math.ceil((cooldownMs - (now - lastChange)) / (1000 * 60 * 60));
      return new Response(JSON.stringify({ 
        error: `Pengguna Free harus menunggu 2x24 jam antar perubahan username. Silakan tunggu ${remainingHours} jam lagi atau upgrade ke PRO.` 
      }), { status: 403 });
    }

    // 4. Periksa ketersediaan username di database
    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE LOWER(username) = ? AND id != ?"
    ).bind(cleanUsername, userId).first();

    if (existing) {
      return new Response(JSON.stringify({ 
        error: `Username '${cleanUsername}' sudah digunakan orang lain. Silakan pilih nama lain.` 
      }), { status: 409 });
    }

    // 5. Update username & timestamp di tabel users
    await env.DB.prepare(
      "UPDATE users SET username = ?, last_username_change = ? WHERE id = ?"
    ).bind(cleanUsername, now, userId).run();

    // 6. Jika ada tabel lain yang mengikat nama username (misal data tautan atau visitor log), update di sini
    await env.DB.prepare(
      "UPDATE links SET username = ? WHERE user_id = ?"
    ).bind(cleanUsername, userId).run().catch(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      newUsername: cleanUsername,
      message: "Username berhasil diperbarui!" 
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Gagal mengubah username." }), { status: 500 });
  }
}