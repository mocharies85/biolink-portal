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
  AlertCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [claimUsername, setClaimUsername] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  
  // State langkah modal: 'compare' (tabel harga) atau 'tutorial' (panduan aktivasi)
  const [promoStep, setPromoStep] = useState<'compare' | 'tutorial'>('compare');

  // Munculkan popup promo otomatis setelah 3 detik
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950 relative">
      
      {/* Navigation Bar */}
      <header className="border-b border-neutral-850 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Curiolot Link" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition" 
            />
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
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-emerald-400 font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next-Generation Bio Hub for Independent Creators</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              One sleek link to share <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                everything you create.
              </span>
            </h1>

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
            
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">24h Visual Stories</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Post photo and video updates with background soundtracks and clickable link stickers that automatically expire after 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
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
                Stand out in chats with dedicated 1200x630 rich banner previews, custom titles, and meta descriptions when shared on WhatsApp, Telegram, or X.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Direct Audience Inbox</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Let your fans and brand partners submit collaboration proposals, questions, and inquiries directly to your dashboard inbox.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Actionable Traffic Analytics</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Monitor individual link CTR, device breakdown (mobile vs desktop), and live traffic referrers without sacrificing visitor privacy.
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
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
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

      {/* POPUP PROMO DUA TAHAP */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            {/* Tombol Close Silang */}
            <button
              type="button"
              onClick={handleClosePromo}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* TAHAP 1: PERBANDINGAN TIER FREE VS PRO */}
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
                  
                  {/* Kartu Free Member */}
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
                          <span><strong>4 Standard Themes:</strong> Minimal Dark, Clean White, Forest Emerald, & Navy.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>24h Photo Stories (10s):</strong> Daily visual status updates expired in 24h.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Creator Music Library:</strong> Choose official soundtracks for your stories.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Direct Messaging Inbox:</strong> Receive business inquiries directly to dashboard.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Instant Profile QR Code:</strong> Share your biolink easily via smartphone scan.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                          <span><strong>Profile Views Analytics:</strong> Track total profile page visitors in real-time.</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol FREE */}
                    <button
                      type="button"
                      onClick={handleClosePromo}
                      className="mt-6 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs uppercase tracking-wider transition border border-neutral-700"
                    >
                      Start Free Forever
                    </button>
                  </div>

                  {/* Kartu PRO Creator */}
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
                        <span className="text-3xl font-black text-amber-400">$3</span>
                        <span className="text-xs text-neutral-400">/ month</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                        Unlock maximum branding power, multiply link conversions, and enjoy unlimited creator features.
                      </p>

                      <div className="flex flex-col gap-2.5 text-xs text-neutral-300 border-t border-amber-500/20 pt-4">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">PIN Code Protection:</strong> Lock exclusive downloads, paid content, or private communities behind a passcode.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Smart Scheduling &amp; Expiry:</strong> Schedule exact start dates and automated expiration for limited-time offers.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Custom Wallpaper &amp; PRO Themes:</strong> Upload HD backdrops + Cyberpunk &amp; Sunset themes.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Custom Social Share Card &amp; SEO:</strong> 1200x630 rich banner on WhatsApp, Telegram, X, Facebook, Threads, &amp; LinkedIn.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Spotlight Glow &amp; 'HOT' Badge:</strong> Animated neon glow on priority links to boost CTR.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">60s Video &amp; 25s/45s/60s Photo:</strong> Streaming video 60s via R2 + custom audio upload.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Unlimited Links &amp; Content:</strong> Add unlimited portfolio, shop, and media links.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Deep Real-Time Analytics:</strong> Track CTR, visitor devices, &amp; live traffic referrers.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                          <span><strong className="text-amber-200">Verified Gold PRO Badge:</strong> Gold checkmark badge beside your name for instant trust.</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol PRO */}
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
              /* TAHAP 2: PANDUAN AKTIVASI PRO (DENGAN SYARAT DAFTAR & VERIFIKASI EMAIL TERLEBIH DAHULU) */
              <div className="max-w-2xl mx-auto py-2">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white">How to Activate Curiolot PRO</h2>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                    Please make sure your account is registered and verified before completing payment on Ko-fi.
                  </p>
                </div>

                {/* Banner Peringatan Wajib Daftar Dulu */}
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
                  {/* Step 1: Wajib Daftar Akun Free & Verifikasi Email */}
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

                  {/* Step 2: Gunakan Email / Username yang Sama di Ko-fi */}
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Enter Account Details on Ko-fi</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        On Ko-fi checkout ($5/MO), use the <strong>exact same email</strong> as your registered Curiolot account, or write your <strong>@username</strong> in the message box.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Aktivasi Instan Otomatis */}
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-neutral-800 text-neutral-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Automatic PRO Activation</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Once Ko-fi confirms your transaction, our webhook immediately unlocks PRO access on your dashboard!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
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
                    href="https://ko-fi.com/curiolot"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClosePromo}
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                  >
                    <span>I'm Registered, Go to Ko-fi</span>
                    <ExternalLink className="w-4 h-4" />
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