'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Zap,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [claimUsername, setClaimUsername] = useState('');

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = claimUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername) {
      router.push(`/register?u=${cleanUsername}`);
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      
      {/* Navigation Bar */}
      <header className="border-b border-neutral-850 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Curiolot<span className="text-emerald-400">.link</span>
            </span>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-6 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-emerald-400 font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next-Generation Bio Hub for Independent Creators</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              One sleek link to share <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                everything you create.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Ditch heavy, slow bio pages. Curiolot delivers clean profiles, instant visitor inquiries, 
              and privacy-friendly analytics—powered globally by Cloudflare Edge.
            </p>

            {/* Interactive Username Claim Box */}
            <form onSubmit={handleClaim} className="mt-8 max-w-md mx-auto">
              <div className="flex items-center p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-emerald-500/80 transition shadow-2xl">
                <span className="pl-3.5 pr-1 text-xs text-neutral-500 font-mono select-none">
                  curiolot.link/
                </span>
                <input
                  type="text"
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full bg-transparent text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md shadow-emerald-500/20"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                Free forever tier • No credit card required
              </p>
            </form>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-750 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Edge-Powered Speed</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Loads instantaneously from 300+ edge locations worldwide. Zero unnecessary scripts or slow third-party trackers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-750 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Direct Audience Inbox</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Allow visitors to send you inquiries and feedback straight from your profile page directly to your dashboard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-750 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Actionable Analytics</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Track individual link clicks, overall click-through rates (CTR), and visitor referrer channels with precision.
              </p>
            </div>

          </div>
        </section>

        {/* Live Demo Preview Banner */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 text-center flex flex-col items-center">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Want to see an active bio profile in action?
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Check out sample profiles built on Curiolot to see how clean and responsive the layout looks on mobile and desktop.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                href="/vanth"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
              >
                <span>View @vanth</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/aries"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-755 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
              >
                <span>View @aries</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-850 py-8 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">Curiolot Link</span>
            <span>© {new Date().getFullYear()} — Built for Creators</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 text-[11px]">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-white transition">Claim Username</Link>
            <a href="https://ko-fi.com/cycrack" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}