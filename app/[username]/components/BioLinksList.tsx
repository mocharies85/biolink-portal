import React from 'react';
import { Lock, ExternalLink, Flame } from 'lucide-react';
import { LinkItem, ThemeStyle, getSpotifyEmbedUrl, getYouTubeEmbedUrl } from '../types';

interface BioLinksListProps {
  links: LinkItem[];
  loadingLinks: boolean;
  isPro: boolean;
  theme: ThemeStyle;
  onLinkClick: (id: number) => void;
  onRequirePin: (link: LinkItem) => void;
}

export default function BioLinksList({
  links,
  loadingLinks,
  isPro,
  theme,
  onLinkClick,
  onRequirePin,
}: BioLinksListProps) {
  if (loadingLinks) {
    return (
      <section className="w-full flex flex-col gap-3.5 mb-8">
        <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
          Loading links...
        </div>
      </section>
    );
  }

  const activeLinks = links.filter((link) => {
    if (link.is_header === 1) return true;
    if (link.is_active === 0 || link.active === false) return false;

    const now = new Date().getTime();
    if (link.schedule_start) {
      const startTime = new Date(link.schedule_start).getTime();
      if (!isNaN(startTime) && now < startTime) return false;
    }
    if (link.schedule_end) {
      const endTime = new Date(link.schedule_end).getTime();
      if (!isNaN(endTime) && now > endTime) return false;
    }
    return true;
  });

  return (
    <section className="w-full flex flex-col gap-3.5 mb-8">
      {activeLinks.map((link) => {
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

        const hasPin = Boolean(
          link.has_pin ||
          (link as any).hasPin ||
          (link.pin_code && String(link.pin_code).trim().length > 0)
        );

        const spotifyEmbed = isPro && !hasPin && getSpotifyEmbedUrl(link.url);
        const youtubeEmbed = isPro && !hasPin && getYouTubeEmbedUrl(link.url);

        if (spotifyEmbed) {
          return (
            <div
              key={link.id}
              className={`w-full rounded-2xl overflow-hidden border p-3 transition-all duration-300 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}
            >
              {link.title && (
                <p className={`text-xs font-semibold mb-2.5 px-1 truncate ${theme.textPrimary}`}>
                  {link.title}
                </p>
              )}
              <iframe
                src={spotifyEmbed}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full rounded-xl"
              />
            </div>
          );
        }

        if (youtubeEmbed) {
          return (
            <div
              key={link.id}
              className={`w-full rounded-2xl overflow-hidden border p-3 transition-all duration-300 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}
            >
              {link.title && (
                <p className={`text-xs font-semibold mb-2.5 px-1 truncate ${theme.textPrimary}`}>
                  {link.title}
                </p>
              )}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 shadow-inner">
                <iframe
                  src={youtubeEmbed}
                  title={link.title || 'YouTube Video Player'}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          );
        }

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
                onRequirePin(link);
                return;
              }
              if (!link.url) {
                e.preventDefault();
                return;
              }
              onLinkClick(link.id);
            }}
            className={`relative group w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:scale-[1.015] active:scale-[0.99] backdrop-blur-md cursor-pointer ${
              isSpotlight
                ? 'bg-gradient-to-r from-amber-500/15 via-neutral-900 to-amber-500/15 border-2 border-amber-400 shadow-lg shadow-amber-500/20 hover:border-amber-300'
                : isHighlight
                ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 hover:border-emerald-400'
                : `${theme.cardBg} ${theme.cardBorder}`
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
      })}
    </section>
  );
}