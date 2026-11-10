'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Check,
  Star,
  TrendingUp,
  Play,
  Mail,
  ShieldCheck,
  ArrowRight,
  Send,
  X,
  CheckCircle2,
  Globe,
} from 'lucide-react';

export type MediaKitTheme = 'onyx' | 'sand' | 'studio' | 'violet';

interface RateCardItem {
  id: string;
  name: string;
  deliverables: string[];
  price: number;
  highlighted?: boolean;
}

interface CollabClient {
  name: string;
  rating: number;
  reach: string;
  testimonial?: string;
}

interface MediaKitData {
  bio: string;
  niche: string;
  total_reach: string;
  avg_engagement: string;
  monthly_impressions: string;
  audience_gender: { male: number; female: number };
  top_countries: { country: string; percent: number }[];
  showcase_videos: { title: string; views: string; thumbnail: string; video_url?: string }[];
  platforms: { name: string; handle: string; count: string; icon: string }[];
  rate_cards: RateCardItem[];
  clients: CollabClient[];
  theme?: MediaKitTheme;
}

const THEME_STYLES: Record<MediaKitTheme, {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBadge: string;
  accentBtn: string;
  statHighlight: string;
}> = {
  onyx: {
    pageBg: 'bg-[#0a0a0c]',
    cardBg: 'bg-[#121216]/90 backdrop-blur-md',
    cardBorder: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-neutral-400',
    accent: 'text-emerald-400',
    accentBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950',
    statHighlight: 'text-white font-black',
  },
  sand: {
    pageBg: 'bg-[#f7f4ef]',
    cardBg: 'bg-[#ffffff]/90 backdrop-blur-md',
    cardBorder: 'border-[#e4ded4]',
    textPrimary: 'text-[#2b2520]',
    textSecondary: 'text-[#7a7168]',
    accent: 'text-[#9e6740]',
    accentBadge: 'bg-[#9e6740]/10 border-[#9e6740]/25 text-[#9e6740]',
    accentBtn: 'bg-[#9e6740] hover:bg-[#855330] text-white',
    statHighlight: 'text-[#2b2520] font-serif font-bold',
  },
  studio: {
    pageBg: 'bg-[#fafafa]',
    cardBg: 'bg-white',
    cardBorder: 'border-neutral-200',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-500',
    accent: 'text-neutral-900',
    accentBadge: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    accentBtn: 'bg-neutral-950 hover:bg-neutral-800 text-white',
    statHighlight: 'text-neutral-950 font-black',
  },
  violet: {
    pageBg: 'bg-[#0d0714]',
    cardBg: 'bg-[#170e24]/90 backdrop-blur-md',
    cardBorder: 'border-purple-500/20',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-300/70',
    accent: 'text-fuchsia-400',
    accentBadge: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400',
    accentBtn: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:brightness-110 text-white',
    statHighlight: 'text-white font-black',
  },
};

interface MediaKitClientProps {
  username?: string;
}

export default function MediaKitClient({ username: propUsername }: MediaKitClientProps = {}) {
  // Mendeteksi username otomatis jika tidak dioper melalui props
  const [username, setUsername] = useState<string>(() => {
    if (propUsername) return propUsername.toLowerCase();
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        return pathPart.toLowerCase();
      }
    }
    return '';
  });

  const [themeKey, setThemeKey] = useState<MediaKitTheme>('onyx');
  const [profile, setProfile] = useState<any>(null);
  const [mediaKit, setMediaKit] = useState<MediaKitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Inquire Modal States
  const [inquiryModal, setInquiryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<RateCardItem | null>(null);
  const [brandEmail, setBrandEmail] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandBudget, setBrandBudget] = useState('');
  const [brandMessage, setBrandMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (!username && typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        setUsername(pathPart.toLowerCase());
      }
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;

    let active = true;
    Promise.all([
      fetch(`/api/profile?username=${encodeURIComponent(username)}`).then((r) => r.json()),
      fetch(`/api/mediakit?username=${encodeURIComponent(username)}`).then((r) => r.json()),
    ])
      .then(([profData, kitData]) => {
        if (!active) return;
        if (profData?.profile) setProfile(profData.profile);

        const kit = kitData?.mediakit || kitData?.mediaKit;
        if (kit) {
          setMediaKit(kit);
          if (kit.theme && THEME_STYLES[kit.theme as MediaKitTheme]) {
            setThemeKey(kit.theme as MediaKitTheme);
          }
        }
      })
      .catch((e) => console.error('Error fetching mediakit:', e))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  const th = THEME_STYLES[themeKey];

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInquiry = (pkg?: RateCardItem) => {
    setSelectedPackage(pkg || null);
    setBrandBudget(pkg ? `$${pkg.price}` : '');
    setInquiryModal(true);
    setInquirySuccess(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInquiry(true);
    try {
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: username,
          name: `${brandName} (Brand Inquiry)`,
          email: brandEmail,
          message: `Package: ${selectedPackage?.name || 'General Inquiry'}\nBudget: ${brandBudget}\n\nBrief:\n${brandMessage}`,
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => {
          setInquiryModal(false);
          setBrandName('');
          setBrandEmail('');
          setBrandMessage('');
        }, 2200);
      } else {
        alert('Failed to send collaboration inquiry. Please try again.');
      }
    } catch {
      alert('Network error. Failed to reach the creator.');
    } finally {
      setSendingInquiry(false);
    }
  };

  const displayBio = mediaKit?.bio || profile?.bio || 'Full-time content creator crafting authentic reviews, engaging video reels, and high-impact digital activations for global brands.';
  const displayNiche = mediaKit?.niche || 'LIFESTYLE • TECH • TRAVEL';
  const totalReach = mediaKit?.total_reach || '2.4M+';
  const avgEng = mediaKit?.avg_engagement || '4.8%';
  const monthlyImpr = mediaKit?.monthly_impressions || '8.2M';

  const platforms = mediaKit?.platforms?.length ? mediaKit.platforms : [
    { name: 'Instagram', handle: `@${username}`, count: '410K', icon: 'ig' },
    { name: 'TikTok', handle: `@${username}`, count: '1.2M', icon: 'tiktok' },
    { name: 'YouTube', handle: `${profile?.name || username}`, count: '280K', icon: 'yt' },
    { name: 'X / Twitter', handle: `@${username}`, count: '95K', icon: 'x' },
  ];

  const packages: RateCardItem[] = mediaKit?.rate_cards?.length ? mediaKit.rate_cards : [
    {
      id: 'pkg-1',
      name: 'Dedicated Short-Form Video',
      price: 850,
      deliverables: ['1x TikTok + 1x Instagram Reel', '30-Day Digital Ad Usage Rights', 'Link in Bio for 7 Days', 'Raw 4K Footage Delivery'],
      highlighted: true,
    },
    {
      id: 'pkg-2',
      name: 'Story Feature & Product Tag',
      price: 350,
      deliverables: ['3x Story Frames with Swipe-Up Link', 'Brand Mention & Custom Promo Code', '24h High Engagement Timing'],
      highlighted: false,
    },
    {
      id: 'pkg-3',
      name: 'Omni-Channel Brand Package',
      price: 1600,
      deliverables: ['1x YouTube Dedicated Integration (60s)', '1x TikTok Dedicated Video', 'Instagram Carousel Review Post', '60-Day Commercial Whitelisting'],
      highlighted: false,
    },
  ];

  const renderSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ig':
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'yt':
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'x':
      case 'twitter':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 transition-colors duration-300 font-sans ${th.pageBg}`}>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* Navigation & Theme Switcher */}
        <div className="flex items-center justify-between border-b pb-4 border-white/10">
          <a
            href={`/${username}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${th.cardBorder} ${th.textSecondary} hover:${th.textPrimary} transition`}
          >
            ← Back to Bio Hub
          </a>

          <div className="flex items-center gap-1.5 p-1 rounded-full border border-white/10 bg-black/20">
            {(['onyx', 'sand', 'studio', 'violet'] as MediaKitTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThemeKey(t)}
                title={`Theme: ${t}`}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                  themeKey === t
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : `${th.textSecondary} hover:${th.textPrimary}`
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-2 rounded-full border transition ${th.cardBorder} ${th.textSecondary} hover:${th.textPrimary}`}
            title="Share Media Kit"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Hero Section */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
          <div className="relative shrink-0">
            <img
              src={profile?.avatar || '/default-avatar.svg'}
              alt={profile?.name || username}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-2xl border-2 border-white/15"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider shadow-lg flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${th.accentBadge}`}>
              {displayNiche}
            </span>

            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${th.textPrimary}`}>
              {profile?.name || username}
            </h1>

            <p className={`text-xs font-semibold uppercase tracking-wider ${th.accent}`}>
              @{username} • Media Kit &amp; Partnership Portfolio
            </p>

            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${th.textSecondary} max-w-lg`}>
              {displayBio}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => handleOpenInquiry()}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${th.accentBtn}`}
              >
                <Mail className="w-4 h-4" />
                <span>Inquire Collaboration</span>
              </button>
              
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${th.textSecondary}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                0% Agency Surcharge
              </span>
            </div>
          </div>
        </header>

        {/* High-Impact Stat Highlights */}
        <section className={`grid grid-cols-3 gap-3 p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} shadow-xl`}>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Total Reach</span>
            <span className={`text-xl sm:text-3xl mt-0.5 ${th.statHighlight}`}>{totalReach}</span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Across Platforms
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left border-x px-3 border-white/10">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Avg Engagement</span>
            <span className={`text-xl sm:text-3xl mt-0.5 ${th.statHighlight}`}>{avgEng}</span>
            <span className={`text-[10px] ${th.textSecondary} font-medium mt-0.5`}>Industry Top 5%</span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Monthly Views</span>
            <span className={`text-xl sm:text-3xl mt-0.5 ${th.statHighlight}`}>{monthlyImpr}</span>
            <span className={`text-[10px] ${th.textSecondary} font-medium mt-0.5`}>Impressions / 30d</span>
          </div>
        </section>

        {/* Platform Breakdown Cards */}
        <section className="flex flex-col gap-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary} px-1`}>
            Verified Audience by Platform
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {platforms.map((p, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${th.cardBg} ${th.cardBorder} transition hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-2 rounded-xl bg-black/20 ${th.textPrimary}`}>
                    {renderSocialIcon(p.icon)}
                  </span>
                  <span className={`text-base font-extrabold ${th.statHighlight}`}>{p.count}</span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${th.textPrimary}`}>{p.name}</h4>
                  <p className={`text-[10px] truncate ${th.textSecondary}`}>{p.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase Content Reels */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary}`}>
              Recent Showcase Content &amp; UGC Reel
            </h3>
            <span className={`text-[10px] font-semibold ${th.accent}`}>High Organic Performance</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { title: 'Sponsored Unboxing & Styling', views: '420K views', bg: 'bg-emerald-950/40' },
              { title: 'Tech Desk Setup Walkthrough', views: '890K views', bg: 'bg-indigo-950/40' },
              { title: '30-Day Lifestyle Routine', views: '310K views', bg: 'bg-amber-950/40' },
            ].map((v, i) => (
              <div
                key={i}
                className={`aspect-[9/14] rounded-2xl border ${th.cardBorder} relative overflow-hidden group p-3 flex flex-col justify-between ${v.bg}`}
              >
                <div className="flex justify-between items-center z-10">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                    {v.views}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="z-10">
                  <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                    {v.title}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* Audience Demographics */}
        <section className={`p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textPrimary}`}>
                Audience Demographics &amp; Insights
              </h3>
              <p className={`text-[11px] mt-0.5 ${th.textSecondary}`}>Verified follower composition and core consumer base</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${th.accentBadge}`}>
              Age 18 - 34: 78%
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className={th.textPrimary}>Female (58%)</span>
              <span className={th.textSecondary}>Male (42%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-neutral-800/40 overflow-hidden flex">
              <div className="h-full bg-rose-400 rounded-l-full" style={{ width: '58%' }} />
              <div className="h-full bg-sky-400 rounded-r-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
            <div>
              <span className={`text-[10px] block ${th.textSecondary}`}>1. United States</span>
              <strong className={`text-xs ${th.textPrimary}`}>46%</strong>
            </div>
            <div>
              <span className={`text-[10px] block ${th.textSecondary}`}>2. United Kingdom</span>
              <strong className={`text-xs ${th.textPrimary}`}>22%</strong>
            </div>
            <div>
              <span className={`text-[10px] block ${th.textSecondary}`}>3. Canada &amp; EU</span>
              <strong className={`text-xs ${th.textPrimary}`}>18%</strong>
            </div>
          </div>
        </section>

        {/* Rate Cards & Packages */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary}`}>
                Standard Collaboration Rates &amp; Packages
              </h3>
              <p className={`text-[11px] ${th.textSecondary} mt-0.5`}>Transparent flat-rate pricing. Bespoke contracts available upon request.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${th.cardBg} ${
                  pkg.highlighted ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : th.cardBorder
                }`}
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${th.textPrimary}`}>{pkg.name}</h4>
                    {pkg.highlighted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    {pkg.deliverables.map((d, i) => (
                      <li key={i} className={`flex items-center gap-1.5 ${th.textSecondary}`}>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-3">
                  <div className="text-left sm:text-right">
                    <span className={`text-[10px] uppercase font-bold block ${th.textSecondary}`}>Starting At</span>
                    <span className={`text-2xl font-black ${th.statHighlight}`}>${pkg.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenInquiry(pkg)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${th.accentBtn}`}
                  >
                    <span>Request Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className={`p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textPrimary}`}>
              Recent Brand Partnerships &amp; Testimonials
            </h3>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className={`font-bold ${th.textPrimary}`}>Nordic Clean Beauty</span>
                <span className="text-[10px] text-emerald-400 font-bold">14.2% ROAS</span>
              </div>
              <p className={`text-[11px] leading-relaxed italic ${th.textSecondary}`}>
                &ldquo;Content delivery was exceptional and generated our highest converting TikTok traffic of Q3.&rdquo;
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className={`font-bold ${th.textPrimary}`}>Apex Tech Gear</span>
                <span className="text-[10px] text-emerald-400 font-bold">380K Reach</span>
              </div>
              <p className={`text-[11px] leading-relaxed italic ${th.textSecondary}`}>
                &ldquo;Professional communication and top-tier camera work. Look forward to our next quarterly campaign.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center flex flex-col items-center gap-2 pt-4 pb-12 border-t border-white/10">
          <p className={`text-xs font-semibold ${th.textPrimary}`}>
            Ready to collaborate with @{username}?
          </p>
          <button
            type="button"
            onClick={() => handleOpenInquiry()}
            className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-xl ${th.accentBtn}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Partnership Proposal</span>
          </button>
          <span className={`text-[10px] mt-2 ${th.textSecondary}`}>
            Verified Creator Media Kit Powered by <strong>Curiolot Link</strong> • 0% Platform Agency Fee
          </span>
        </footer>
      </div>

      {/* Brand Partnership Proposal Modal */}
      {inquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col gap-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setInquiryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sponsorship &amp; Booking Brief</h3>
                <p className="text-xs text-neutral-400">Direct transmission to @{username}</p>
              </div>
            </div>

            {inquirySuccess ? (
              <div className="p-6 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Proposal Dispatched!</h4>
                <p className="text-xs text-neutral-400">
                  The creator has received your brief and will respond within 24–48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Studio"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Official Brand Email</label>
                  <input
                    type="email"
                    required
                    placeholder="collab@brand.com"
                    value={brandEmail}
                    onChange={(e) => setBrandEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Selected Package</label>
                    <input
                      type="text"
                      disabled
                      value={selectedPackage?.name || 'Custom Package'}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-400 truncate cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Budget / Offer</label>
                    <input
                      type="text"
                      placeholder="$850"
                      value={brandBudget}
                      onChange={(e) => setBrandBudget(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Campaign Goals &amp; Deliverable Brief</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about your product, desired timeline, and required usage rights..."
                    value={brandMessage}
                    onChange={(e) => setBrandMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition flex items-center justify-center gap-1.5 mt-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingInquiry ? 'Sending...' : 'Submit Partnership Proposal'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}