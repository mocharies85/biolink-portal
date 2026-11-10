'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Radio,
  Flame,
  Palette,
  Share2,
  MessageSquare,
  BarChart3,
  ExternalLink,
  X,
  CreditCard,
  ArrowLeft,
  UserCheck,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Percent,
  ChevronRight,
  DollarSign
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [claimUsername, setClaimUsername] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [promoStep, setPromoStep] = useState<'compare' | 'tutorial'>('compare');

  // Trigger automated promo popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const seen = sessionStorage.getItem('curiolot_promo_closed');
      if (!seen) {
        setShowPromo(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClosePromo = () => {
    setShowPromo(false);
    setPromoStep('compare');
    sessionStorage.setItem('curiolot_promo_closed', 'true');
  };

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950 relative overflow-x-hidden">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Curiolot Link" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition" 
            />
            <span className="font-black text-base tracking-tight text-white">
              Curiolot<span className="text-cyan-400">.link</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-black text-xs transition shadow-md shadow-white/10 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Value Headline & Claim Form */}
          <div className="flex-1 text-center lg:text-left flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold self-center lg:self-start shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Bio Link &amp; Creator Media Kit</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              One sleek link to share <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300">
                everything you create.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Consolidate your links, 24-hour stories, background audio, and a verified
              <strong className="text-amber-300 font-semibold"> Rate Card Media Kit </strong>
              to close paid sponsorships with 0% platform commissions.
            </p>

            {/* Username Claim Box */}
            <form onSubmit={handleClaim} className="w-full max-w-md mx-auto lg:mx-0">
              <div className="flex items-center p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition shadow-2xl">
                <span className="pl-3.5 pr-1 text-xs text-neutral-500 font-mono select-none">
                  curiolot.link/
                </span>
                <input
                  type="text"
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none font-medium py-2 px-1"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-500/20"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2 text-center lg:text-left">
                Free tier available • No credit card required to start
              </p>
            </form>

            <div className="flex items-center justify-center lg:justify-start gap-5 pt-2 text-[11px] text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free Forever Tier
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 0% Fee for PRO
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Cloudflare Edge
              </span>
            </div>
          </div>

          {/* Right Column: Phone Mockup */}
          <div className="flex-1 w-full max-w-sm relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 rounded-[48px] blur-2xl pointer-events-none" />

            <div className="relative rounded-[42px] border-4 border-neutral-800 bg-neutral-950 p-3 shadow-2xl ring-1 ring-white/10">
              <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-3" />

              <div className="rounded-[32px] bg-neutral-900/95 border border-neutral-800/80 p-5 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-amber-300 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-[14px] bg-neutral-950 flex items-center justify-center font-black text-lg text-white">
                      AR
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-amber-400 text-neutral-950">
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white flex items-center justify-center gap-1">
                    Alex Rivera <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Tech Creator &amp; Digital Architect
                  </p>
                </div>

                {/* Media Kit CTA inside Mockup */}
                <div className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Creator Media Kit &amp; Rates</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                </div>

                <div className="w-full flex flex-col gap-2">
                  <div className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-200 flex items-center justify-between">
                    <span>🚀 Latest YouTube Video</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                  </div>
                  <div className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-200 flex items-center justify-between">
                    <span>🎨 Vector Asset Portfolio</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                  </div>
                  <div className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-200 flex items-center justify-between">
                    <span>🎮 Play Browser Games Online</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                  </div>
                </div>

                <div className="w-full pt-2 border-t border-neutral-800/80 flex items-center justify-around text-[10px] text-neutral-400">
                  <div>
                    <span className="font-bold text-white block">50K+</span> Reach
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400 block">4.8%</span> Eng.
                  </div>
                  <div>
                    <span className="font-bold text-cyan-400 block">250K</span> Views
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Features Highlights Grid */}
        <section className="max-w-6xl mx-auto px-6 py-14 border-t border-neutral-850">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Creator Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Everything required to scale your personal brand.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Rate Card &amp; Media Kit</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Display verified metrics and rate cards. Let sponsors calculate packages and submit collaboration briefs directly to your inbox.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">24h Visual Stories</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Post photo and video updates with background soundtracks and clickable link stickers that automatically expire after 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-cyan-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Spotlight Glow Links</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Highlight priority content, drops, or affiliate offers with eye-catching gold neon glow animations and 'HOT' badges to multiply clicks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Curated Themes &amp; Wallpapers</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Choose from sleek dark and vibrant neon color palettes, or upload your own high-resolution backdrop wallpaper for complete branding.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Custom Social Share Cards</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Stand out in chats with dedicated 1200x630 rich banner previews, custom titles, and meta descriptions when shared across socials.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-teal-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Privacy-First Analytics</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Monitor individual link CTR, device breakdown (mobile vs desktop), and live traffic referrers without sacrificing visitor privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Live Demo Profiles Section */}
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
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
              >
                <span>View @vanth</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/aries"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
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
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-white transition">Claim Username</Link>
            <a href="https://ko-fi.com/curiolot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>

      {/* Automated 2-Step Promo Popup Modal */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={handleClosePromo}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: FREE VS PRO PLAN COMPARISON */}
            {promoStep === 'compare' ? (
              <>
                <div className="text-center mb-6">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    ⚡ Curiolot Link • Creator Hub
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Supercharge Your Bio Hub: <span className="text-emerald-400">FREE</span> vs{' '}
                    <span className="text-amber-400">PRO</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl mx-auto">
                    One sleek link for all your portfolios, digital store, social channels, and 24h visual updates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                  
                  {/* Free Member Card */}
                  <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
                          Starter Tier
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          FREE FOREVER
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white">Free Member</h3>
                      <div className="flex items-baseline gap-1 mt-1 mb-2">
                        <span className="text-3xl font-black text-white">$0</span>
                        <span className="text-xs text-neutral-400">/ free lifetime access</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                        Essential tools for creators to establish a clean and professional online bio presence instantly.
                      </p>

                      <div className="flex flex-col gap-2.5 text-xs text-neutral-300 border-t border-neutral-800/80 pt-4">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Free Forever:</strong> No monthly subscriptions, no credit card required.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Up to 3 Custom Links:</strong> Showcase portfolio, store, or primary handles.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Basic Media Kit:</strong> Accept brand deals with standard 9% platform processing fee.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>24h Photo Stories (10s):</strong> Daily visual status updates expired in 24h.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Direct Messaging Inbox:</strong> Receive business inquiries directly to dashboard.</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClosePromo}
                      className="mt-6 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider transition border border-neutral-700"
                    >
                      Start Free Forever
                    </button>
                  </div>

                  {/* PRO Creator Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 via-neutral-900 to-neutral-950 border-2 border-amber-500/60 flex flex-col justify-between shadow-xl shadow-amber-500/10">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Most Popular
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          CANCEL ANYTIME
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-amber-400">PRO Creator</h3>
                      <div className="flex items-baseline gap-1 mt-1 mb-2">
                        <span className="text-3xl font-black text-amber-400">$5</span>
                        <span className="text-xs text-neutral-400">/ month</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                        Unlock maximum branding power, keep 100% of your earnings, and access unlimited features.
                      </p>

                      <div className="flex flex-col gap-2.5 text-xs text-neutral-300 border-t border-amber-500/20 pt-4">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">0% Platform Fee:</strong> Keep 100% of all brand sponsorships and deal revenue.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Rate Card &amp; Bundle Calculator:</strong> Let brands book instant package discounts.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">PIN Code Protection:</strong> Lock exclusive downloads behind a passcode.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Spotlight Glow &amp; 'HOT' Badge:</strong> Animated neon glow on priority links to boost CTR.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Unlimited Links &amp; Content:</strong> Add unlimited portfolio, shop, and media links.</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPromoStep('tutorial')}
                      className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                    >
                      <span>Upgrade to PRO ($5/MO)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </>
            ) : (
              /* STEP 2: PRO ACTIVATION TUTORIAL */
              <div className="max-w-2xl mx-auto py-2">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white">How to Activate Curiolot PRO</h2>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                    Please make sure your account is registered and verified before completing payment on Paddle.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-5 flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300">New here? Please create your free account first!</p>
                    <p className="text-neutral-400 mt-1 leading-relaxed">
                      You must have an active, email-verified Curiolot account so our system knows where to apply your PRO features upon payment.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5 mb-6">
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-3.5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Register Free &amp; Verify Email</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">Required</span>
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                          Sign up for a Free account and click the verification link sent to your inbox.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      onClick={handleClosePromo}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold shrink-0 transition flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Register Now</span>
                    </Link>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Upgrade to PRO in Dashboard</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Log in to your account and click <strong>"Upgrade to PRO"</strong> ($5/mo). Secure checkout is powered by Paddle with Credit/Debit Card or PayPal.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-neutral-800 text-neutral-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Instant PRO Activation</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Once your Paddle payment is completed, our system immediately activates your PRO features automatically!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPromoStep('compare')}
                    className="w-1/3 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-neutral-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <a
                    href="/login"
                    onClick={handleClosePromo}
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
                  >
                    <span>I'm Registered, Login &amp; Upgrade</span>
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}