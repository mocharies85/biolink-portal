import React from 'react';
import { Sparkles, QrCode, Share2, Check } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { UserProfile, StoryItem, ThemeStyle, SocialLinks } from '../types';

interface BioHeaderProps {
  username: string;
  profile: UserProfile;
  isPro: boolean;
  theme: ThemeStyle;
  stories: StoryItem[];
  isCopied: boolean;
  onOpenStory: () => void;
  onOpenQr: () => void;
  onShare: () => void;
}

export default function BioHeader({
  username,
  profile,
  isPro,
  theme,
  stories,
  isCopied,
  onOpenStory,
  onOpenQr,
  onShare,
}: BioHeaderProps) {
  let parsedSocials: SocialLinks = {};
  if (typeof profile.socials === 'string') {
    try {
      parsedSocials = JSON.parse(profile.socials);
    } catch {}
  } else if (profile.socials) {
    parsedSocials = profile.socials;
  }

  return (
    <>
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-white/10 gap-2">
        <a
          href="/register"
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition shadow-sm ${theme.accentBadge}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create your link</span>
        </a>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <a
            href="/login"
            className="text-[11px] font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition"
          >
            Log in
          </a>

          <button
            type="button"
            onClick={onOpenQr}
            aria-label="Show QR Code"
            title="Show QR Code"
            className="p-2 rounded-full border border-white/15 bg-black/30 hover:bg-black/50 text-neutral-300 hover:text-white transition shadow-md"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onShare}
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
              if (stories.length > 0) onOpenStory();
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
              onClick={onOpenStory}
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

      {/* Social Links Bar */}
      {Boolean(
        parsedSocials.instagram ||
        parsedSocials.tiktok ||
        parsedSocials.youtube ||
        parsedSocials.x ||
        parsedSocials.github ||
        parsedSocials.whatsapp ||
        parsedSocials.facebook ||
        parsedSocials.linkedin ||
        parsedSocials.discord ||
        parsedSocials.twitch
      ) && (
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
          {parsedSocials.facebook && (
            <a
              href={
                parsedSocials.facebook.startsWith('http')
                  ? parsedSocials.facebook
                  : `https://facebook.com/${parsedSocials.facebook.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-blue-600/50 hover:text-blue-500 text-neutral-300 transition transform hover:-translate-y-0.5"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
          {parsedSocials.linkedin && (
            <a
              href={
                parsedSocials.linkedin.startsWith('http')
                  ? parsedSocials.linkedin
                  : `https://linkedin.com/in/${parsedSocials.linkedin.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-sky-600/50 hover:text-sky-400 text-neutral-300 transition transform hover:-translate-y-0.5"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          )}
          {parsedSocials.discord && (
            <a
              href={
                parsedSocials.discord.startsWith('http')
                  ? parsedSocials.discord
                  : `https://discord.gg/${parsedSocials.discord}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-indigo-500/50 hover:text-indigo-400 text-neutral-300 transition transform hover:-translate-y-0.5"
              title="Discord"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
          )}
          {parsedSocials.twitch && (
            <a
              href={
                parsedSocials.twitch.startsWith('http')
                  ? parsedSocials.twitch
                  : `https://twitch.tv/${parsedSocials.twitch.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-purple-500/50 hover:text-purple-400 text-neutral-300 transition transform hover:-translate-y-0.5"
              title="Twitch"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.429h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
            </a>
          )}
        </div>
      )}
    </>
  );
}