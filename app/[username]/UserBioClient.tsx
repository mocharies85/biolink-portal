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
  Flame
} from 'lucide-react';
import StoryModal from '@/components/StoryModal';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  desc?: string;
  is_active?: number | boolean;
  active?: boolean;
  is_highlighted?: number | boolean;
  highlight?: boolean;
  is_spotlight?: number | boolean;
  clicks?: number;
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

export default function UserBioClient() {
  // 1. Ambil username murni langsung dari URL browser saat ini (misal: /vanth)
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        return pathPart.toLowerCase();
      }
    }
    return '';
  });

  const [profile, setProfile] = useState<{
    name: string;
    tagline: string;
    bio: string;
    avatar: string;
    socials?: string | SocialLinks;
    is_pro?: number;
  }>({
    name: '',
    tagline: 'Digital Creator & Independent Maker',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
    socials: {},
    is_pro: 0
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  // State untuk fitur Story
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Sinkronkan username jika terjadi navigasi URL di browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        setUsername(pathPart.toLowerCase());
      }
    }
  }, []);

  // 2. Ambil profil, tautan, dan story KHUSUS untuk username aktif
  useEffect(() => {
    if (!username) return;

    let isCurrent = true;
    setLoadingLinks(true);

    // 1. Ambil data profil username bersangkutan
    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setProfile({
            name: username.toUpperCase(),
            tagline: 'Digital Creator',
            bio: `Welcome to the official hub of @${username}.`,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
            socials: {},
            is_pro: 0
          });
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));

    // 2. Ambil data tautan & status PRO user bersangkutan
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

    // 3. Ambil story aktif user bersangkutan
    fetch(`/api/stories?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setStories(Array.isArray(data.stories) ? data.stories : []);
      })
      .catch((err) => console.error('Failed to load stories:', err));

    // 4. Catat kunjungan views
    const sessionKey = `curiolot_viewed_${username}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      fetch(`/api/views?username=${encodeURIComponent(username)}`, { method: 'POST' })
        .then(() => sessionStorage.setItem(sessionKey, '1'))
        .catch((err) => console.error('Failed to log view:', err));
    }

    return () => {
      isCurrent = false; // Mencegah data user lain menimpa jika berpindah halaman
    };
  }, [username]);

  const handleLinkClick = (id: number) => {
    fetch(`/api/click?id=${id}`, { method: 'POST' }).catch(() => {});
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

  const isPro = isProUser || profile.is_pro === 1;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Top Navigation Bar */}
        <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-neutral-900">
          <a
            href="/register"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full transition shadow-sm shadow-emerald-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create your link</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="text-[11px] font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-neutral-900 transition"
            >
              Log in
            </a>

            <button 
              onClick={handleShare} 
              aria-label="Share profile"
              className={`p-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 shadow-md ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white'
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
                src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'}
                alt={profile.name || username}
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
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {profile.name || username.toUpperCase()}
            </h1>
            {isPro && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-emerald-400 mt-1 tracking-wider uppercase">
            @{username} • {profile.tagline}
          </p>

          {profile.bio && (
            <p className="text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500/50 hover:text-pink-400 text-neutral-400 transition transform hover:-translate-y-0.5"
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-400 transition transform hover:-translate-y-0.5"
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:text-red-400 text-neutral-400 transition transform hover:-translate-y-0.5"
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-400 hover:text-white text-neutral-400 transition transform hover:-translate-y-0.5"
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 hover:text-purple-400 text-neutral-400 transition transform hover:-translate-y-0.5"
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
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 hover:text-emerald-400 text-neutral-400 transition transform hover:-translate-y-0.5"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.892-.47-1.464-.608-2.433-2.094-2.508-2.193-.075-.098-.598-.795-.598-1.517 0-.722.378-1.077.514-1.223.136-.145.297-.182.396-.182.099 0 .198.001.284.005.092.004.215-.035.335.253.125.298.428 1.042.465 1.117.037.075.062.162.012.261-.05.098-.075.161-.15.248-.075.086-.157.192-.224.258-.075.074-.153.155-.066.304.087.149.387.639.831 1.034.571.508 1.054.665 1.203.74.149.074.236.062.323-.037.087-.1.372-.434.471-.583.099-.149.198-.124.334-.074.137.05 8.65 4.09 1.002 4.254z"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Links List with Spotlight */}
        <section className="w-full flex flex-col gap-3.5 mb-8">
          {loadingLinks ? (
            <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
              Loading links...
            </div>
          ) : (
            links
              .filter((link) => link.is_active === 1 || link.is_active === undefined || link.active)
              .map((link) => {
                const isHighlight = Boolean(link.is_highlighted || link.highlight);
                const isSpotlight = Boolean(link.is_spotlight === 1 || link.is_spotlight === true);
                const descText = link.description || link.desc;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.id)}
                    className={`relative group w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:scale-[1.015] active:scale-[0.99] ${
                      isSpotlight
                        ? 'bg-gradient-to-r from-amber-500/15 via-neutral-900 to-amber-500/15 border-2 border-amber-400 shadow-lg shadow-amber-500/20 hover:border-amber-300'
                        : isHighlight
                        ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/20'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
                    }`}
                  >
                    {isSpotlight && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame className="w-2.5 h-2.5 fill-current" /> HOT
                      </span>
                    )}

                    <div className="flex flex-col text-left truncate pr-2">
                      <span className={`text-sm font-semibold flex items-center gap-1.5 truncate ${
                        isSpotlight ? 'text-amber-300' : 'text-neutral-100 group-hover:text-white'
                      }`}>
                        {link.title}
                        {isHighlight && !isSpotlight && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </span>
                      {descText && (
                        <span className="text-xs text-neutral-400 mt-0.5 truncate">{descText}</span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl shrink-0 transition ${
                      isSpotlight ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-500 group-hover:text-neutral-200'
                    }`}>
                      <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </a>
                );
              })
          )}
        </section>

        {/* Direct Messaging Section */}
        <section className="w-full p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm mb-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Direct Inquiry to @{username}</h2>
          </div>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Have a project collaboration, freelance inquiry, or message? Send a note directly to this inbox.
          </p>

          {isSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-300">Message Delivered!</p>
              <p className="text-[11px] text-neutral-400">Thank you for reaching out. The creator will receive your note shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col gap-2.5">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Name or Email (Optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
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