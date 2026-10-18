'use client';

import React from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoModal({ isOpen, onClose }: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
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

        {/* Comparison Grid: FREE vs PRO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          
          {/* LEFT CARD: FREE MEMBER */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
                  Starter Tier
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
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

            {/* FREE Button */}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs uppercase tracking-wider transition border border-neutral-700"
            >
              Start Free Forever
            </button>
          </div>

          {/* RIGHT CARD: PRO CREATOR */}
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
                  <span><strong className="text-amber-200">Smart Scheduling & Expiry:</strong> Schedule exact start dates and automated expiration for limited-time offers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Spotlight Glow & 'HOT' Badge:</strong> Animated neon glow on priority links to boost CTR.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Unlimited Links & Section Headers:</strong> Organize your bio into structured categories without link limits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Custom Wallpaper & PRO Themes:</strong> Upload HD backdrops + Cyberpunk & Sunset themes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Custom Social Share Card & SEO:</strong> 1200x630 rich banner on WhatsApp, Telegram, X, Facebook, Threads, & LinkedIn.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">60s Video & 25s/45s/60s Photo:</strong> Streaming video 60s via R2 + custom audio upload.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Deep Real-Time Analytics:</strong> Track CTR, visitor devices, & live traffic referrers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">★</span>
                  <span><strong className="text-amber-200">Verified Gold PRO Badge:</strong> Gold checkmark badge beside your name for instant trust.</span>
                </div>
              </div>
            </div>

            {/* PRO Button */}
            <a
              href="https://ko-fi.com/curiolot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <span>Upgrade to PRO ($3/MO)</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}