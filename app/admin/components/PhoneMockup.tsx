'use client';

import React from 'react';
import { Flame, Briefcase, ExternalLink, Video } from 'lucide-react';
import { ProfileData, LinkItem, StoryItem, MediaKitData } from '../types';

interface PhoneMockupProps {
  profile: ProfileData;
  links: LinkItem[];
  stories: StoryItem[];
  activeUsername: string;
  isProUser: boolean;
  activeTheme: {
    mockupBg?: string;
    bg?: string;
    pageBg?: string;
    cardBg?: string;
    card?: string;
    cardBorder?: string;
    textPrimary?: string;
    textSecondary?: string;
    accent?: string;
    text?: string;
  };
  mediaKit?: MediaKitData;
}

export default function PhoneMockup({
  profile,
  links,
  stories,
  activeUsername,
  isProUser,
  activeTheme,
  mediaKit,
}: PhoneMockupProps) {
  // Verifikasi apakah Media Kit aktif dan memiliki minimal 1 paket
  const hasValidPackages = (mediaKit?.rate_cards?.length ?? 0) > 0;
  const isMediaKitShown = Boolean(isProUser && mediaKit?.is_enabled && hasValidPackages);

  // Fallback kelas tema agar selalu sinkron
  const bgClass =
    activeTheme?.mockupBg ||
    activeTheme?.bg ||
    activeTheme?.pageBg ||
    'bg-neutral-950';

  const cardClass =
    activeTheme?.cardBg ||
    activeTheme?.card ||
    'bg-neutral-900/90';

  const borderClass = activeTheme?.cardBorder || 'border-neutral-800';
  const textPrimaryClass = activeTheme?.textPrimary || activeTheme?.text || 'text-white';
  const textSecondaryClass = activeTheme?.textSecondary || 'text-neutral-400';
  const accentClass = activeTheme?.accent || 'text-emerald-400';

  return (
    <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
      <div
        className={`w-full max-w-[280px] h-[560px] border-[6px] border-neutral-800 rounded-[40px] shadow-2xl p-4 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${bgClass}`}
        style={
          isProUser && profile.bg_image
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${profile.bg_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Dynamic Island / Notch Mockup */}
        <div className="w-20 h-4 bg-neutral-800/80 rounded-full mb-5 shrink-0" />

        {/* Scrollable Bio Screen */}
        <div className="w-full flex-1 overflow-y-auto flex flex-col items-center no-scrollbar">
          {/* Avatar Profile */}
          <div className="relative">
            <img
              src={profile.avatar || '/default-avatar.svg'}
              alt={profile.name}
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.svg';
              }}
              className={`w-16 h-16 rounded-full object-cover mb-2 shrink-0 shadow-lg transition ${
                stories.length > 0
                  ? 'border-2 border-emerald-400 ring-2 ring-emerald-400/50'
                  : 'border-2 border-emerald-500/40'
              }`}
            />
            {stories.length > 0 && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-neutral-950 px-1.5 py-0.2 rounded-full text-[7px] font-black uppercase tracking-wider">
                Story
              </span>
            )}
          </div>

          {/* Name & PRO Badge */}
          <div className="flex items-center justify-center gap-1 mt-1">
            <h4 className={`text-xs font-bold text-center truncate max-w-[180px] ${textPrimaryClass}`}>
              {profile.name}
            </h4>
            {isProUser && (
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[8px] font-bold border border-amber-500/30">
                PRO
              </span>
            )}
          </div>

          <p className={`text-[10px] font-medium text-center ${accentClass}`}>
            {profile.tagline}
          </p>
          {profile.bio && (
            <p className={`text-[9px] text-center mt-1 px-2 line-clamp-2 leading-relaxed ${textSecondaryClass}`}>
              {profile.bio}
            </p>
          )}

          {/* Social Icons Bar */}
          {profile.socials && Object.values(profile.socials).some((val) => Boolean(val)) && (
            <div className="flex items-center justify-center gap-1.5 my-2.5 flex-wrap">
              {profile.socials.instagram && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">ig</span>
              )}
              {profile.socials.tiktok && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">tt</span>
              )}
              {profile.socials.youtube && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">yt</span>
              )}
              {profile.socials.whatsapp && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">wa</span>
              )}
              {profile.socials.x && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">x</span>
              )}
              {profile.socials.github && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">gh</span>
              )}
              {profile.socials.facebook && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">fb</span>
              )}
              {profile.socials.linkedin && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">li</span>
              )}
              {profile.socials.discord && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">dc</span>
              )}
              {profile.socials.twitch && (
                <span className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 text-[9px]">tw</span>
              )}
            </div>
          )}

          {/* Product Showcase Video Preview */}
          {isProUser && profile.show_featured_video === 1 && profile.featured_video_url && (
            <div className="w-full my-2 rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video relative shrink-0 shadow-inner">
              <video
                src={profile.featured_video_url}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1 bg-black/60 rounded px-1 py-0.5 text-[8px] text-white flex items-center gap-0.5">
                <Video className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Creator Media Kit Button (Otomatis tampil hanya jika ON & paket > 0) */}
          {isMediaKitShown && (
            <div className="w-full my-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[9px] flex items-center justify-between transition shadow-sm animate-fade-in">
              <div className="flex items-center gap-1.5 truncate">
                <Briefcase className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">View Creator Media Kit &amp; Rates</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
            </div>
          )}

          {/* Links List in Mockup */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {links.map((l) => {
              const isSpotlight = l.is_spotlight === 1;

              return (
                <div
                  key={l.id}
                  className={`relative w-full py-2.5 px-3 rounded-xl border text-[10px] text-center truncate shadow-sm transition backdrop-blur-sm ${
                    isSpotlight
                      ? 'bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-amber-500/10'
                      : `${cardClass} ${borderClass} ${textPrimaryClass}`
                  }`}
                >
                  {isSpotlight && (
                    <span className="absolute -top-1.5 right-2 px-1 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-black text-[7px] uppercase tracking-wider flex items-center gap-0.5">
                      <Flame className="w-2 h-2 fill-current" /> HOT
                    </span>
                  )}
                  <span className="block truncate">{l.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[9px] text-neutral-500 mt-2 shrink-0">Live Preview (@{activeUsername})</p>
      </div>
    </aside>
  );
}