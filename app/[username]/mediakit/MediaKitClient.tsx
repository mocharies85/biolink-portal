'use client';

import React, { useState, useEffect } from 'react';
import {
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
  ExternalLink,
} from 'lucide-react';

export type MediaKitTheme = 'onyx' | 'sand' | 'studio' | 'violet';

interface RateCardItem {
  id?: string;
  name?: string;
  title?: string;
  deliverable?: string;
  platform?: string;
  description?: string;
  deliverables?: string[];
  price?: number | string;
  sample_url?: string;
  highlighted?: boolean;
}

interface PlatformItem {
  id?: string;
  platform: string;
  handle: string;
  followers: string;
}

interface ShowcaseVideoItem {
  id?: string;
  title: string;
  views: string;
  video_url: string;
  thumbnail?: string;
}

interface CountryItem {
  country: string;
  percent: number;
}

interface TestimonialItem {
  id?: string;
  brand: string;
  metric: string;
  quote: string;
}

interface MediaKitData {
  headline?: string;
  bio?: string;
  about?: string;
  pitch_bio?: string;
  niche?: string;
  primary_niche?: string;
  total_followers?: number | string;
  total_reach?: string;
  total_audience_reach?: string;
  engagement_rate?: number | string;
  avg_engagement?: string;
  avg_engagement_rate?: string;
  monthly_impressions?: number | string;
  audience_country?: string;
  top_country?: string;
  contact_email?: string;
  rate_cards?: RateCardItem[];
  theme?: MediaKitTheme;
  platforms?: PlatformItem[];
  showcase_videos?: ShowcaseVideoItem[];
  gender_female?: number;
  top_countries?: CountryItem[];
  testimonials?: TestimonialItem[];
}

const THEME_STYLES: Record<MediaKitTheme, {
  name: string;
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
    name: 'Onyx Noir',
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
    name: 'Warm Sand',
    pageBg: 'bg-[#f5f1eb]',
    cardBg: 'bg-[#ffffff]/90 backdrop-blur-md',
    cardBorder: 'border-[#e3dcd1]',
    textPrimary: 'text-[#26211c]',
    textSecondary: 'text-[#756a5e]',
    accent: 'text-[#99623b]',
    accentBadge: 'bg-[#99623b]/10 border-[#99623b]/25 text-[#99623b]',
    accentBtn: 'bg-[#99623b] hover:bg-[#804e2b] text-white',
    statHighlight: 'text-[#26211c] font-serif font-bold',
  },
  studio: {
    name: 'Clean Studio',
    pageBg: 'bg-[#fafafa]',
    cardBg: 'bg-white',
    cardBorder: 'border-neutral-200',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-500',
    accent: 'text-neutral-950',
    accentBadge: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    accentBtn: 'bg-neutral-950 hover:bg-neutral-800 text-white',
    statHighlight: 'text-neutral-950 font-black',
  },
  violet: {
    name: 'Cyber Violet',
    pageBg: 'bg-[#0d0716]',
    cardBg: 'bg-[#170e28]/90 backdrop-blur-md',
    cardBorder: 'border-purple-500/25',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-300/70',
    accent: 'text-fuchsia-400',
    accentBadge: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400',
    accentBtn: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:brightness-110 text-white',
    statHighlight: 'text-white font-black',
  },
};

function getYoutubeThumbnail(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

interface MediaKitClientProps {
  username?: string;
}

export default function MediaKitClient({ username: propUsername }: MediaKitClientProps = {}) {
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
  const [copied, setCopied] = useState(false);

  // Proposal Modal State
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
      fetch(`/api/profile?username=${encodeURIComponent(username)}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/mediakit?username=${encodeURIComponent(username)}`).then((r) => r.json()).catch(() => null),
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
      .catch((e) => console.error('Error fetching mediakit:', e));

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
    setBrandBudget(pkg?.price ? `$${pkg.price}` : '');
    setInquiryModal(true);
    setInquirySuccess(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInquiry(true);
    try {
      const pkgTitle = selectedPackage?.deliverable || selectedPackage?.title || selectedPackage?.name || 'General Partnership';
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: username,
          name: `${brandName} (Brand Proposal)`,
          email: brandEmail,
          message: `Package: ${pkgTitle}\nBudget: ${brandBudget}\n\nBrief:\n${brandMessage}`,
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

  // Real Creator Data (Zero hardcoded dummy metrics)
  const headline = mediaKit?.headline || 'Content Creator & Brand Partner';
  const displayBio = mediaKit?.about || mediaKit?.pitch_bio || mediaKit?.bio || profile?.bio || '';
  const displayNiche = mediaKit?.primary_niche || mediaKit?.niche || '';

  const formatCompact = (val: number | string | undefined): string => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
    return num > 0 ? num.toLocaleString() : '';
  };

  const totalReach = formatCompact(mediaKit?.total_followers || mediaKit?.total_audience_reach || mediaKit?.total_reach);
  const monthlyImpr = formatCompact(mediaKit?.monthly_impressions);
  const rawEng = mediaKit?.engagement_rate ?? mediaKit?.avg_engagement_rate ?? mediaKit?.avg_engagement;
  const avgEng = rawEng !== undefined && Number(rawEng) > 0 ? `${rawEng}%` : '';
  const hasTopMetrics = Boolean(totalReach || monthlyImpr || avgEng);

  const topCountry = mediaKit?.audience_country || mediaKit?.top_country || '';
  const platforms = Array.isArray(mediaKit?.platforms) ? mediaKit!.platforms : [];
  const showcaseVideos = Array.isArray(mediaKit?.showcase_videos) ? mediaKit!.showcase_videos : [];
  const topCountries = Array.isArray(mediaKit?.top_countries) ? mediaKit!.top_countries : [];
  const testimonials = Array.isArray(mediaKit?.testimonials) ? mediaKit!.testimonials : [];
  const packagesList = Array.isArray(mediaKit?.rate_cards) ? mediaKit!.rate_cards : [];

  const femalePct = mediaKit?.gender_female;
  const hasGenderSplit = femalePct !== undefined && !isNaN(femalePct);
  const malePct = hasGenderSplit ? Math.max(0, 100 - femalePct!) : 0;
  const hasDemographics = hasGenderSplit || topCountries.length > 0 || Boolean(topCountry);

  const renderSocialIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
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
      case 'x / twitter':
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
    <div className={`min-h-screen py-8 px-4 sm:px-6 transition-colors duration-300 font-sans ${th.pageBg}`}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* 1. Public Navigation Bar */}
        <div className={`p-3 rounded-2xl border ${th.cardBg} ${th.cardBorder} flex items-center justify-between shadow-md`}>
          <a
            href={`/${username}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${th.cardBorder} ${th.textSecondary} hover:${th.textPrimary} transition`}
          >
            ← Back to Bio Hub
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-2 rounded-xl border transition ${th.cardBorder} ${th.textSecondary} hover:${th.textPrimary}`}
            title="Share Media Kit"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Hero Profile Header */}
        <header className={`p-6 rounded-3xl border ${th.cardBg} ${th.cardBorder} flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xl`}>
          <div className="relative shrink-0">
            <img
              src={profile?.avatar || '/default-avatar.svg'}
              alt={profile?.name || username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg border-2 border-white/15"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 flex-1">
            {displayNiche && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${th.accentBadge}`}>
                {displayNiche}
              </span>
            )}

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${th.textPrimary}`}>
              {profile?.name || username}
            </h1>

            <p className={`text-xs font-semibold ${th.accent}`}>
              @{username} • {headline}
            </p>

            {displayBio && (
              <p className={`text-xs mt-1 leading-relaxed ${th.textSecondary} max-w-lg`}>
                {displayBio}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleOpenInquiry()}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-md ${th.accentBtn}`}
              >
                <Mail className="w-4 h-4" />
                <span>Inquire Collaboration</span>
              </button>
              
              <span className={`text-[11px] font-medium flex items-center gap-1 ${th.textSecondary}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                0% Agency Surcharge
              </span>
            </div>
          </div>
        </header>

        {/* 3. High-Impact Reach Metrics (Shown only if creator configured metrics) */}
        {hasTopMetrics && (
          <section className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} shadow-lg text-center`}>
            {totalReach && (
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Total Reach</span>
                <span className={`text-xl sm:text-2xl mt-1 block ${th.statHighlight}`}>{totalReach}</span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> Combined Audience
                </span>
              </div>
            )}

            {avgEng && (
              <div className="sm:border-x px-2 border-white/10">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Avg Engagement</span>
                <span className={`text-xl sm:text-2xl mt-1 block ${th.statHighlight}`}>{avgEng}</span>
                <span className={`text-[10px] ${th.textSecondary} font-medium mt-0.5`}>Verified Rate</span>
              </div>
            )}

            {monthlyImpr && (
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${th.textSecondary}`}>Monthly Impressions</span>
                <span className={`text-xl sm:text-2xl mt-1 block ${th.statHighlight}`}>{monthlyImpr}</span>
                <span className={`text-[10px] ${th.textSecondary} font-medium mt-0.5`}>Views / 30d</span>
              </div>
            )}
          </section>
        )}

        {/* 4. Verified Audience by Platform (Shown only if creator added platforms) */}
        {platforms.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary} px-1`}>
              Verified Audience by Platform
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {platforms.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${th.cardBg} ${th.cardBorder} transition hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-xl bg-black/20 ${th.textPrimary}`}>
                      {renderSocialIcon(p.platform)}
                    </span>
                    <span className={`text-base font-extrabold ${th.statHighlight}`}>{p.followers}</span>
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${th.textPrimary}`}>{p.platform}</h4>
                    <p className={`text-[10px] truncate ${th.textSecondary}`}>{p.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Showcase Content Reels (Shown only if creator added real videos) */}
        {showcaseVideos.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary}`}>
                Recent Showcase Content &amp; UGC Reel
              </h3>
              <span className={`text-[10px] font-semibold ${th.accent}`}>Featured Campaigns</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {showcaseVideos.map((v, i) => {
                const thumbImg = v.thumbnail || getYoutubeThumbnail(v.video_url);
                return (
                  <a
                    key={v.id || i}
                    href={v.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`aspect-[9/14] rounded-2xl border ${th.cardBorder} relative overflow-hidden group p-3 flex flex-col justify-between bg-neutral-900 transition hover:scale-[1.02]`}
                  >
                    {thumbImg && (
                      <img
                        src={thumbImg}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
                      />
                    )}
                    <div className="flex justify-between items-center z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[9px] font-bold">
                        {v.views}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-neutral-950 transition">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="z-10">
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                        {v.title}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Audience Demographics (Shown only if creator filled demographics) */}
        {hasDemographics && (
          <section className={`p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} flex flex-col gap-3 shadow-md`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textPrimary}`}>
                Audience Demographics &amp; Insights
              </h3>
              {topCountry && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${th.accentBadge}`}>
                  Top Country: {topCountry}
                </span>
              )}
            </div>

            {hasGenderSplit && (
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={th.textPrimary}>Female ({femalePct}%)</span>
                  <span className={th.textSecondary}>Male ({malePct}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-neutral-800/40 overflow-hidden flex">
                  <div className="h-full bg-rose-400 rounded-l-full" style={{ width: `${femalePct}%` }} />
                  <div className="h-full bg-sky-400 rounded-r-full" style={{ width: `${malePct}%` }} />
                </div>
              </div>
            )}

            {topCountries.length > 0 && (
              <div className={`grid grid-cols-${topCountries.length} gap-2 pt-2 border-t border-white/5 text-center`}>
                {topCountries.map((c, idx) => (
                  <div key={idx}>
                    <span className={`text-[10px] block ${th.textSecondary}`}>{idx + 1}. {c.country}</span>
                    <strong className={`text-xs ${th.textPrimary}`}>{c.percent}%</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 7. Rate Cards & Deliverables */}
        {packagesList.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${th.textSecondary}`}>
                Standard Collaboration Rates &amp; Packages
              </h3>
              <span className={`text-[10px] ${th.accent} font-semibold`}>Instant Booking Available</span>
            </div>

            <div className="flex flex-col gap-3">
              {packagesList.map((pkg, idx) => {
                const pkgTitle = pkg.deliverable || pkg.title || pkg.name || 'Collaboration Package';
                const pkgPrice = pkg.price !== undefined ? pkg.price : 150;
                
                const deliverablesList = Array.isArray(pkg.deliverables) && pkg.deliverables.length > 0
                  ? pkg.deliverables
                  : pkg.description
                    ? [pkg.description]
                    : ['Dedicated partnership content with full commercial rights.'];

                return (
                  <div
                    key={pkg.id || idx}
                    className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${th.cardBg} ${
                      pkg.highlighted ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : th.cardBorder
                    }`}
                  >
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {pkg.platform && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 bg-black/30 border border-white/10 ${th.textPrimary}`}>
                            {renderSocialIcon(pkg.platform)}
                            <span>{pkg.platform}</span>
                          </span>
                        )}
                        <h4 className={`text-sm font-bold ${th.textPrimary}`}>{pkgTitle}</h4>
                      </div>

                      <ul className="grid grid-cols-1 gap-1.5 text-[11px]">
                        {deliverablesList.map((d, i) => (
                          <li key={i} className={`flex items-center gap-1.5 ${th.textSecondary}`}>
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>

                      {pkg.sample_url && (
                        <a
                          href={pkg.sample_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[11px] font-semibold flex items-center gap-1 ${th.accent} hover:underline mt-0.5`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Sample Campaign Video</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-3">
                      <div className="text-left sm:text-right">
                        <span className={`text-[10px] uppercase font-bold block ${th.textSecondary}`}>Starting At</span>
                        <span className={`text-2xl font-black ${th.statHighlight}`}>${pkgPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenInquiry(pkg)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-md ${th.accentBtn}`}
                      >
                        <span>Request Booking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 8. Recent Brand Partnerships & Testimonials (Shown only if creator added reviews) */}
        {testimonials.length > 0 && (
          <section className={`p-5 rounded-3xl border ${th.cardBg} ${th.cardBorder} flex flex-col gap-3 shadow-md`}>
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
              {testimonials.map((t, idx) => (
                <div key={t.id || idx} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${th.textPrimary}`}>{t.brand}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{t.metric}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed italic ${th.textSecondary}`}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Footer Guarantee */}
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

      {/* 10. Brand Partnership Proposal Modal */}
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
                      value={selectedPackage?.deliverable || selectedPackage?.title || selectedPackage?.name || 'Custom Package'}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-400 truncate cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Budget / Offer</label>
                    <input
                      type="text"
                      placeholder="$150"
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