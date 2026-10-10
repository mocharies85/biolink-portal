'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, MailCheck, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisteredEmail(email);
      } else {
        setErrorMsg(data.error || 'Failed to create account.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl relative z-10 flex flex-col items-center">
        
        {registeredEmail ? (
          <div className="text-center flex flex-col items-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
              <MailCheck className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-white">Check Your Email</h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              We have sent an activation link to:
            </p>
            <p className="text-xs font-semibold text-emerald-400 mt-1 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 break-all">
              {registeredEmail}
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-400 text-left leading-relaxed">
              <p className="font-semibold text-neutral-300 mb-1">Next steps:</p>
              1. Open your email inbox (or spam folder).<br />
              2. Click the verification link to activate your bio-link.<br />
              3. Log in to personalize your page.
            </div>

            <a
              href="/login"
              className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 mb-4 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">Claim Your Bio-Link</h1>
            <p className="text-xs text-neutral-400 mt-1.5 text-center leading-relaxed">
              Create your free personal link hub for your projects, portfolio, and apparel store.
            </p>

            <form onSubmit={handleRegister} className="w-full mt-6 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="username (e.g. alex)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
              >
                <span>{loading ? 'Creating Account...' : 'Get Started for Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-neutral-500">
              Already have an account?{' '}
              <a href="/login" className="text-emerald-400 hover:underline">
                Log in
              </a>
            </div>
          </>
        )}

      </div>
    </main>
  );
}