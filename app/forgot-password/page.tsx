'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <h1 className="text-xl font-bold mb-1">Forgot Password</h1>
        <p className="text-xs text-neutral-400 mb-6">Enter your registered email to receive a reset link.</p>

        {submitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-xs text-emerald-400 font-semibold mb-2">Check your email!</p>
            <p className="text-[11px] text-neutral-400 mb-4">We sent a reset link to your inbox. Check spam if not found.</p>
            <Link href="/login" className="text-xs text-emerald-400 underline font-medium">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div>
              <label className="text-xs text-neutral-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-2">
              <Link href="/login" className="text-xs text-neutral-400 hover:text-white">Remember your password? Log in</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}