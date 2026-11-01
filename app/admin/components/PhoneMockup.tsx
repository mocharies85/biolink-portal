'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { ProfileData, LinkItem, StoryItem } from '../types';

interface PhoneMockupProps {
  profile: ProfileData;
  links: LinkItem[];
  stories: StoryItem[];
  activeUsername: string;
  isProUser: boolean;
  activeTheme: {
    mockupBg: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
}

export default function PhoneMockup({
  profile,
  links,
  stories,
  activeUsername,
  isProUser,
  activeTheme,
}: PhoneMockupProps) {
  return (
    <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
      <div
        className={`w-full max-w-[280px] h-[560px] border-[6px] border-neutral-800 rounded-[40px] shadow-2xl p-4 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${activeTheme.mockupBg}`}
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
        <div className="w-20 h-4 bg-neutral-800/80 rounded-full mb-5 shrink-0" />

        <div className="w-full flex-1 overflow-y-auto flex flex-col items-center">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
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

          <div className="flex items-center justify-center gap-1 mt-1">
            <h4 className={`text-xs font-bold text-center truncate max-w-[180px] ${activeTheme.textPrimary}`}>
              {profile.name}
            </h4>
            {isProUser && (
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[8px] font-bold border border-amber-500/30">
                PRO
              </span>
            )}
          </div>

          <p className={`text-[10px] font-medium text-center ${activeTheme.accent}`}>
            {profile.tagline}
          </p>
          {profile.bio && (
            <p className={`text-[9px] text-center mt-1 px-2 line-clamp-2 leading-relaxed ${activeTheme.textSecondary}`}>
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

          {/* Links in Mockup */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {links.map((l) => {
              const isSpotlight = l.is_spotlight === 1;

              return (
                <div
                  key={l.id}
                  className={`relative w-full py-2.5 px-3 rounded-xl border text-[10px] text-center truncate shadow-sm transition backdrop-blur-sm ${
                    isSpotlight
                      ? 'bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-amber-500/10'
                      : `${activeTheme.cardBg} ${activeTheme.cardBorder} ${activeTheme.textPrimary}`
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