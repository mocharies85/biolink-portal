'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Simpan data sesi pengguna ke browser
        sessionStorage.setItem('curiolot_auth_user', JSON.stringify(data.user));
        router.push('/admin');
      } else {
        setErrorMsg(data.error || 'Failed to login. Please check your credentials.');
      }
    } catch {
      setErrorMsg('Network connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 mb-4 shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">Log in to Curiolot</h1>
        <p className="text-xs text-neutral-400 mt-1.5 text-center leading-relaxed">
          Manage your links, portfolio settings, and audience inbox.
        </p>

        <form onSubmit={handleLogin} className="w-full mt-6 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Username or Email"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
            />
            <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
            />
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Don&apos;t have an account yet?{' '}
          <a href="/register" className="text-emerald-400 hover:underline">
            Claim your link
          </a>
        </div>
      </div>
    </main>
  );
}