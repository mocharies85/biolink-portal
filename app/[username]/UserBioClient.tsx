'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  ExternalLink, 
  Heart, 
  Sparkles, 
  CheckCircle2,
  Share2,
  Check,
  Flame,
  QrCode,
  Download,
  X,
  Lock,
  KeyRound
} from 'lucide-react';
import StoryModal from '@/components/StoryModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  desc?: string;
  clicks?: number;
  is_active?: number;
  active?: number | boolean;
  is_spotlight?: number;
  is_highlighted?: number | boolean;
  highlight?: number | boolean;
  has_pin?: boolean;
  pin_code?: string | null;
  is_header?: number;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  github?: string;
  whatsapp?: string;
}

interface StoryItem {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number;
}

// Konfigurasi Gaya Preset Tema
const THEMES: Record<string, {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBadge: string;
  inboxBg: string;
}> = {
  dark: {
    pageBg: 'bg-neutral-950 text-neutral-100',
    cardBg: 'bg-neutral-900/90 hover:bg-neutral-800/80',
    cardBorder: 'border-neutral-800 hover:border-neutral-700',
    textPrimary: 'text-neutral-100',
    textSecondary: 'text-neutral-400',
    accent: 'text-emerald-400',
    accentBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inboxBg: 'bg-neutral-900/60 border-neutral-800/80',
  },
  light: {
    pageBg: 'bg-slate-50 text-slate-900',
    cardBg: 'bg-white hover:bg-slate-100/90 shadow-sm',
    cardBorder: 'border-slate-200 hover:border-slate-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accent: 'text-indigo-600',
    accentBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    inboxBg: 'bg-white/80 border-slate-200 shadow-sm',
  },
  emerald: {
    pageBg: 'bg-[#061a14] text-emerald-50',
    cardBg: 'bg-[#0a261e]/90 hover:bg-[#0e3328]/80',
    cardBorder: 'border-emerald-900/60 hover:border-emerald-700/60',
    textPrimary: 'text-emerald-100',
    textSecondary: 'text-emerald-400/80',
    accent: 'text-emerald-400',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    inboxBg: 'bg-[#0a261e]/70 border-emerald-900/80',
  },
  midnight: {
    pageBg: 'bg-[#0b0f19] text-blue-50',
    cardBg: 'bg-[#111827]/90 hover:bg-[#1f2937]/80',
    cardBorder: 'border-slate-800 hover:border-slate-700',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: 'text-sky-400',
    accentBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    inboxBg: 'bg-[#111827]/70 border-slate-800',
  },
  cyberpunk: {
    pageBg: 'bg-[#080312] text-fuchsia-50',
    cardBg: 'bg-[#150a29]/90 hover:bg-[#200f3e]/80',
    cardBorder: 'border-fuchsia-900/60 hover:border-fuchsia-500/60',
    textPrimary: 'text-fuchsia-100',
    textSecondary: 'text-fuchsia-300/70',
    accent: 'text-yellow-400',
    accentBadge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    inboxBg: 'bg-[#150a29]/70 border-fuchsia-900/80',
  },
  sunset: {
    pageBg: 'bg-[#18080a] text-amber-50',
    cardBg: 'bg-[#260e12]/90 hover:bg-[#38141a]/80',
    cardBorder: 'border-amber-950/80 hover:border-rose-900/80',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-rose-300/80',
    accent: 'text-amber-400',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    inboxBg: 'bg-[#260e12]/70 border-rose-950/80',
  }
};

export default function UserBioClient() {
  const { t } = useLanguage();

  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        return pathPart.toLowerCase();
      }
    }
    return '';
  });

  // --- TEMPELKAN DI SINI (State untuk Protected Smart Link PIN) ---
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedPinLinkId, setSelectedPinLinkId] = useState<number | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  // ----------------------------------------------------------------

  const [profile, setProfile] = useState<{
    name: string;
    tagline: string;
    bio: string;
    avatar: string;
    socials?: string | SocialLinks;
    is_pro?: number;
    theme?: string;
    bg_image?: string;
  }>({
    name: '',
    tagline: 'Digital Creator',
    bio: '',
    avatar: '/default-avatar.svg',
    socials: {},
    is_pro: 0,
    theme: 'dark',
    bg_image: ''
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // State untuk Pop-up Buka Kunci PIN
  const [targetPinLink, setTargetPinLink] = useState<LinkItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinLink || !pinInput.trim()) return;

    setIsVerifyingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_pin',
          linkId: targetPinLink.id,
          pin: pinInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error || 'Kode PIN tidak cocok.');
        setIsVerifyingPin(false);
        return;
      }

      // PIN benar: buka link asli di tab baru dan tutup modal
      window.open(data.url, '_blank');
      setPinModalOpen(false);
      setPinInput('');
      setTargetPinLink(null);
    } catch {
      setPinError('Gagal memverifikasi PIN. Periksa koneksi Anda.');
    } finally {
      setIsVerifyingPin(false);
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        setUsername(pathPart.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    let isCurrent = true;
    setLoadingLinks(true);

    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));

    fetch(`/api/links?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setLinks(data.links || []);
        setIsProUser(Boolean(data.isPro));
      })
      .catch((err) => console.error('Failed to load links:', err))
      .finally(() => {
        if (isCurrent) setLoadingLinks(false);
      });

    fetch(`/api/stories?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setStories(Array.isArray(data.stories) ? data.stories : []);
      })
      .catch((err) => console.error('Failed to load stories:', err));

    const sessionKey = `curiolot_viewed_${username}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      fetch(`/api/views?username=${encodeURIComponent(username)}`, { method: 'POST' })
        .then(() => sessionStorage.setItem(sessionKey, '1'))
        .catch((err) => console.error('Failed to log view:', err));
    }

    return () => {
      isCurrent = false;
    };
  }, [username]);

  const handleLinkClick = (id: number) => {
    fetch(`/api/click?id=${id}`, { method: 'POST' }).catch(() => {});
  };

  const handleProtectedLinkClick = (e: React.MouseEvent, link: any) => {
    if (link.has_pin) {
      e.preventDefault();
      setSelectedPinLinkId(link.id);
      setInputPin('');
      setPinError('');
      setPinModalOpen(true);
    } else {
      handleLinkClick(link.id);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim() || !selectedPinLinkId) return;

    setVerifyingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: selectedPinLinkId,
          pin: inputPin.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.targetUrl) {
        setPinModalOpen(false);
        handleLinkClick(selectedPinLinkId);
        window.open(data.targetUrl, '_blank');
      } else {
        setPinError(data.error || 'PIN salah. Akses ditolak.');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN.');
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://link.curiolot.com/${username}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }

    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: profile.name || username,
          text: profile.bio,
          url: currentUrl,
        });
      } catch {}
    }
  };

  const currentFullUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://link.curiolot.com/${username}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(currentFullUrl)}`;

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${username}-biolink-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          sender: senderName.trim() || 'Anonymous',
          content: message.trim(),
        }),
      });

      if (res.ok) {
        setIsSent(true);
        setSenderName('');
        setMessage('');
        setTimeout(() => setIsSent(false), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      alert('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  let parsedSocials: SocialLinks = {};
  if (typeof profile.socials === 'string') {
    try {
      parsedSocials = JSON.parse(profile.socials);
    } catch {}
  } else if (profile.socials) {
    parsedSocials = profile.socials;
  }

  // Hak akses PRO & Aturan Wallpaper
  const isPro = isProUser || profile.is_pro === 1;
  const currentThemeKey = profile.theme && THEMES[profile.theme] ? profile.theme : 'dark';
  const theme = THEMES[currentThemeKey];

  // Wallpaper HANYA aktif jika akun berstatus PRO
  const hasActiveWallpaper = Boolean(isPro && profile.bg_image);

  return (
    <main 
      className={`min-h-screen flex justify-center py-10 px-4 sm:px-6 relative overflow-hidden font-sans transition-colors duration-300 ${theme.pageBg}`}
      style={
        hasActiveWallpaper
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${profile.bg_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {!hasActiveWallpaper && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Top Navigation Bar */}
        <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-white/10 gap-2">
          <a
            href="/register"
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition shadow-sm ${theme.accentBadge}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create your link</span>
          </a>

          <div className="flex items-center gap-2">
            {/* Pemilih Bahasa Otomatis */}
            <LanguageSwitcher />

            <a
              href="/login"
              className="text-[11px] font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              Log in
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              aria-label="Show QR Code"
              title="Show QR Code"
              className="p-2 rounded-full border border-white/15 bg-black/30 hover:bg-black/50 text-neutral-300 hover:text-white transition shadow-md"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleShare} 
              aria-label="Share profile"
              className={`p-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 shadow-md ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-black/30 border-white/15 hover:bg-black/50 text-neutral-300 hover:text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-300 pr-1">Copied!</span>
                </>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-6">
          <div className="relative group">
            <div 
              onClick={() => {
                if (stories.length > 0) setIsStoryOpen(true);
              }}
              className={`w-24 h-24 rounded-full p-1 transition-all duration-300 ${
                stories.length > 0 
                  ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-500 ring-4 ring-emerald-500/30 cursor-pointer hover:scale-105 animate-pulse' 
                  : 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500'
              } shadow-xl shadow-emerald-500/10`}
            >
              <img
                src={profile.avatar || '/default-avatar.svg'}
                alt={profile.name || username}
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.svg';
                }}
                className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
              />
            </div>

            {stories.length > 0 ? (
              <span 
                onClick={() => setIsStoryOpen(true)}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-neutral-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md cursor-pointer pointer-events-auto"
              >
                Story
              </span>
            ) : (
              <span className="absolute bottom-1 right-1 bg-emerald-500 text-neutral-950 p-1 rounded-full text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.name || username.toUpperCase()}
            </h1>
            {isPro && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </div>

          <p className={`text-xs font-semibold mt-1 tracking-wider uppercase ${theme.accent}`}>
            @{username} {profile.tagline ? `• ${profile.tagline}` : ''}
          </p>

          {profile.bio && (
            <p className={`text-sm mt-2 max-w-xs leading-relaxed ${theme.textSecondary}`}>
              {profile.bio}
            </p>
          )}
        </header>

        {/* Social Icons Bar */}
        {(parsedSocials.instagram || parsedSocials.tiktok || parsedSocials.youtube || parsedSocials.x || parsedSocials.github || parsedSocials.whatsapp) && (
          <div className="flex items-center justify-center gap-3 mb-7 flex-wrap">
            {parsedSocials.instagram && (
              <a
                href={`https://instagram.com/${parsedSocials.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-pink-500/50 hover:text-pink-400 text-neutral-300 transition transform hover:-translate-y-0.5"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}

            {parsedSocials.tiktok && (
              <a
                href={`https://tiktok.com/@${parsedSocials.tiktok.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-300 transition transform hover:-translate-y-0.5"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            )}

            {parsedSocials.youtube && (
              <a
                href={parsedSocials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-red-500/50 hover:text-red-400 text-neutral-300 transition transform hover:-translate-y-0.5"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}

            {parsedSocials.x && (
              <a
                href={`https://x.com/${parsedSocials.x.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-neutral-400 hover:text-white text-neutral-300 transition transform hover:-translate-y-0.5"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}

            {parsedSocials.github && (
              <a
                href={`https://github.com/${parsedSocials.github.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-purple-500/50 hover:text-purple-400 text-neutral-300 transition transform hover:-translate-y-0.5"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            )}

            {parsedSocials.whatsapp && (
              <a
                href={`https://wa.me/${parsedSocials.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-emerald-500/50 hover:text-emerald-400 text-neutral-300 transition transform hover:-translate-y-0.5"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.892-.47-1.464-.608-2.433-2.094-2.508-2.193-.075-.098-.598-.795-.598-1.517 0-.722.378-1.077.514-1.223.136-.145.297-.182.396-.182.099 0 .198.001.284.005.092.004.215-.035.335.253.125.298.428 1.042.465 1.117.037.075.062.162.012.261-.05.098-.075.161-.15.248-.075.086-.157.192-.224.258-.075.074-.153.155-.066.304.087.149.387.639.831 1.034.571.508 1.054.665 1.203.74.149.074.236.062.323-.037.087-.1.372-.434.471-.583.099-.149.198-.124.334-.074.137.05 8.65 4.09 1.002 4.254z"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Links List with Spotlight & PIN Protection */}
        <section className="w-full flex flex-col gap-3.5 mb-8">
          {loadingLinks ? (
            <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
              Loading links...
            </div>
          ) : (
            links
              .filter((link) => link.is_header === 1 || link.is_active === 1 || link.is_active === undefined || (link as any).active)
              .map((link) => {
                // Render khusus Section Header (Pemisah Kategori)
                if (link.is_header === 1) {
                  return (
                    <div key={link.id} className="w-full pt-5 pb-1 text-center">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2">
                        {link.title}
                      </h3>
                    </div>
                  );
                }

                const isHighlight = Boolean(link.is_highlighted || (link as any).highlight);
                const isSpotlight = Boolean(link.is_spotlight === 1 || (link as any).is_spotlight === true);
                const descText = link.description || (link as any).desc;
                
                // Deteksi proteksi PIN
                const hasPin = Boolean(
                  link.has_pin ||
                  (link as any).hasPin ||
                  (link.pin_code && String(link.pin_code).trim().length > 0)
                );

                return (
                  <a
                    key={link.id}
                    href={hasPin ? '#' : (link.url || '#')}
                    target={hasPin ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (hasPin) {
                        e.preventDefault();
                        e.stopPropagation();
                        setTargetPinLink(link);
                        setPinInput('');
                        setPinError('');
                        setPinModalOpen(true);
                        return;
                      }
                      if (!link.url) {
                        e.preventDefault();
                        return;
                      }
                      handleLinkClick(link.id);
                    }}
                    className={`relative group w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:scale-[1.015] active:scale-[0.99] backdrop-blur-md cursor-pointer ${
                      isSpotlight
                        ? 'bg-gradient-to-r from-amber-500/15 via-neutral-900 to-amber-500/15 border-2 border-amber-400 shadow-lg shadow-amber-500/20 hover:border-amber-300'
                        : isHighlight
                        ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 hover:border-emerald-400'
                        : `${theme.cardBg}${theme.cardBorder}`
                    }`}
                  >
                    {isSpotlight && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame className="w-2.5 h-2.5 fill-current" /> HOT
                      </span>
                    )}

                    <div className="flex flex-col text-left truncate pr-2">
                      <span className={`text-sm font-semibold flex items-center gap-1.5 truncate ${
                        isSpotlight ? 'text-amber-300' : theme.textPrimary
                      }`}>
                        {hasPin && <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {link.title}
                        {isHighlight && !isSpotlight && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${theme.accentBadge}`}>
                            Featured
                          </span>
                        )}
                      </span>
                      {descText && (
                        <span className={`text-xs mt-0.5 truncate ${theme.textSecondary}`}>{descText}</span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl shrink-0 transition ${
                      isSpotlight ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400 group-hover:text-white'
                    }`}>
                      {hasPin ? (
                        <Lock className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                  </a>
                );
              })
          )}
        </section>

        {/* Direct Messaging Section */}
        <section className={`w-full p-5 rounded-2xl border backdrop-blur-md mb-10 ${theme.inboxBg}`}>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className={`w-4 h-4 ${theme.accent}`} />
            <h2 className="text-sm font-semibold">{t('messages')}</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${theme.textSecondary}`}>
            {t('messageDesc')}
          </p>

          {isSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-300">{t('msgSuccessTitle')}</p>
              <p className="text-[11px] text-neutral-400">{t('msgSuccessDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col gap-2.5">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                placeholder={t('messagePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>{t('sendingBtn')}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('sendBtn')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Branding Footer */}
        <footer className="flex flex-col items-center gap-1 text-center text-xs text-neutral-500">
          <p className="flex items-center gap-1 text-[11px]">
            Powered by <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> Curiolot Link
          </p>
        </footer>

      </div>

      {/* QR Code Modal for Visitors */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">Scan QR Code</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
              Scan to open <strong>@{username}</strong>'s biolink hub on any smartphone.
            </p>

            <div className="my-5 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Biolink QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* Story Modal Viewer */}
      <StoryModal
        stories={stories}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        username={username}
        isPro={isPro}
      />
    </main>
  );
}