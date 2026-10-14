'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, Sparkles, Flame } from 'lucide-react';
import StoryModal from '@/components/StoryModal';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  clicks?: number;
  is_spotlight?: number;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  github?: string;
  whatsapp?: string;
}

interface UserProfile {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  socials?: string | SocialLinks;
}

export default function UserBioPage() {
  const params = useParams();
  const username = (params?.username as string) || 'creator';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  useEffect(() => {
    async function loadBioData() {
      try {
        // 1. Catat kunjungan views
        fetch(`/api/views?username=${username}`, { method: 'POST' }).catch(() => {});

        // 2. Ambil data profil
        const resProf = await fetch(`/api/profile?username=${username}`);
        if (resProf.ok) {
          const data = await resProf.json();
          setProfile(data.profile);
        }

        // 3. Ambil data tautan
        const resLinks = await fetch(`/api/links?username=${username}`);
        if (resLinks.ok) {
          const data = await resLinks.json();
          setLinks(data.links || []);
          setIsPro(data.isPro || false);
        }

        // 4. Ambil cerita aktif
        const resStories = await fetch(`/api/stories?username=${username}`);
        if (resStories.ok) {
          const data = await resStories.json();
          setStories(data.stories || []);
        }
      } catch (err) {
        console.error('Failed to load user bio:', err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      loadBioData();
    }
  }, [username]);

  const handleLinkClick = (id: number) => {
    fetch(`/api/click?id=${id}`, { method: 'POST' }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-xs">
        Loading bio...
      </div>
    );
  }

  // Parse data media sosial dari D1
  let socials: SocialLinks = {};
  if (typeof profile?.socials === 'string') {
    try {
      socials = JSON.parse(profile.socials);
    } catch {}
  } else if (profile?.socials) {
    socials = profile.socials;
  }

  const hasStories = stories && stories.length > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12 selection:bg-emerald-500 selection:text-black font-sans">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Avatar Profil & Story Trigger */}
        <div 
          className="relative cursor-pointer group" 
          onClick={() => hasStories && setIsStoryOpen(true)}
        >
          <img
            src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
            alt={profile?.name || username}
            className={`w-24 h-24 rounded-full object-cover shadow-2xl transition duration-300 group-hover:scale-105 ${
              hasStories
                ? 'p-1 ring-4 ring-emerald-400 ring-offset-4 ring-offset-neutral-950'
                : 'border-2 border-neutral-800'
            }`}
          />
          {hasStories && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider shadow-lg">
              Story
            </span>
          )}
        </div>

        {/* Informasi Nama & Bio */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-lg font-bold text-white">{profile?.name || username}</h1>
            {isPro && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">{profile?.tagline || 'Creator'}</p>
          {profile?.bio && (
            <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Social Icons Bar (Instagram, TikTok, YouTube, X, GitHub, WhatsApp) */}
        <div className="flex items-center justify-center gap-3 mt-4 mb-2 flex-wrap">
          {socials.instagram && (
            <a
              href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500/50 hover:text-pink-400 text-neutral-400 transition transform hover:-translate-y-0.5"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          )}

          {socials.tiktok && (
            <a
              href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-400 transition transform hover:-translate-y-0.5"
              title="TikTok"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          )}

          {socials.youtube && (
            <a
              href={socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:text-red-400 text-neutral-400 transition transform hover:-translate-y-0.5"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          )}

          {socials.x && (
            <a
              href={`https://x.com/${socials.x.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-400 hover:text-white text-neutral-400 transition transform hover:-translate-y-0.5"
              title="X"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          )}

          {socials.github && (
            <a
              href={`https://github.com/${socials.github.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 hover:text-purple-400 text-neutral-400 transition transform hover:-translate-y-0.5"
              title="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          )}

          {socials.whatsapp && (
            <a
              href={`https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 hover:text-emerald-400 text-neutral-400 transition transform hover:-translate-y-0.5"
              title="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.892-.47-1.464-.608-2.433-2.094-2.508-2.193-.075-.098-.598-.795-.598-1.517 0-.722.378-1.077.514-1.223.136-.145.297-.182.396-.182.099 0 .198.001.284.005.092.004.215-.035.335.253.125.298.428 1.042.465 1.117.037.075.062.162.012.261-.05.098-.075.161-.15.248-.075.086-.157.192-.224.258-.075.074-.153.155-.066.304.087.149.387.639.831 1.034.571.508 1.054.665 1.203.74.149.074.236.062.323-.037.087-.1.372-.434.471-.583.099-.149.198-.124.334-.074.137.05 8.65 4.09 1.002 4.254z"/></svg>
            </a>
          )}
        </div>

        {/* Daftar Tautan & Efek Spotlight Glow */}
        <div className="w-full flex flex-col gap-3 mt-4">
          {links.map((link) => {
            const isSpotlight = link.is_spotlight === 1;

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                className={`relative w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group ${
                  isSpotlight
                    ? 'bg-gradient-to-r from-amber-500/15 via-neutral-900 to-amber-500/15 border-2 border-amber-400 shadow-lg shadow-amber-500/20 hover:scale-[1.02]'
                    : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 hover:scale-[1.01]'
                }`}
              >
                {/* Badge Spotlight HOT */}
                {isSpotlight && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-2.5 h-2.5 fill-current" /> HOT
                  </span>
                )}

                <div className="truncate pr-3">
                  <span className={`font-bold text-sm block truncate ${isSpotlight ? 'text-amber-300' : 'text-neutral-100 group-hover:text-emerald-400 transition-colors'}`}>
                    {link.title}
                  </span>
                  {link.description && (
                    <span className="text-xs text-neutral-400 block truncate mt-0.5">
                      {link.description}
                    </span>
                  )}
                </div>

                <div className={`p-2 rounded-xl shrink-0 transition ${
                  isSpotlight
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
                }`}>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>

      </div>

      {/* Story Modal Popup */}
      <StoryModal
        stories={stories}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        username={username}
        isPro={isPro}
      />
    </div>
  );
}