export interface LinkItem {
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
  schedule_start?: string | null;
  schedule_end?: string | null;
  is_header?: number;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  github?: string;
  whatsapp?: string;
  facebook?: string;
  linkedin?: string;
  discord?: string;
  twitch?: string;
}

export interface StoryItem {
  id: string;
  media_url: string;
  media_urls?: string | null;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number;
  total_duration?: number;
  animation_style?: 'slide' | 'fade' | 'zoom';
  created_at: number;
}

export interface UserProfile {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  socials?: string | SocialLinks;
  is_pro?: number;
  theme?: string;
  bg_image?: string;
  featured_video_url?: string;
  show_featured_video?: number;
  featured_video_autoplay?: number;
  featured_video_title?: string;
  bg_music_url?: string;
  bg_music_title?: string;
}

export interface ThemeStyle {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBadge: string;
  inboxBg: string;
}

export const THEMES: Record<string, ThemeStyle> = {
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
  },
  aurora: {
    pageBg: 'bg-[#03131e] text-cyan-50',
    cardBg: 'bg-[#062438]/90 hover:bg-[#0a3552]/80',
    cardBorder: 'border-cyan-900/60 hover:border-cyan-500/60',
    textPrimary: 'text-cyan-100',
    textSecondary: 'text-cyan-300/70',
    accent: 'text-cyan-400',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    inboxBg: 'bg-[#062438]/70 border-cyan-900/80',
  },
  amethyst: {
    pageBg: 'bg-[#0f041c] text-purple-50',
    cardBg: 'bg-[#1c0836]/90 hover:bg-[#2b0d52]/80',
    cardBorder: 'border-purple-900/60 hover:border-purple-500/60',
    textPrimary: 'text-purple-100',
    textSecondary: 'text-purple-300/70',
    accent: 'text-purple-400',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    inboxBg: 'bg-[#1c0836]/70 border-purple-900/80',
  },
  gold: {
    pageBg: 'bg-[#140e02] text-amber-50',
    cardBg: 'bg-[#261b05]/90 hover:bg-[#382808]/80',
    cardBorder: 'border-amber-900/60 hover:border-amber-500/60',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-amber-300/70',
    accent: 'text-amber-400',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    inboxBg: 'bg-[#261b05]/70 border-amber-900/80',
  },
};

export const getSpotifyEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('spotify.com')) return null;
    const match = parsed.pathname.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      const [, type, id] = match;
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
  } catch {
    return null;
  }
  return null;
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split(/[?&]/)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};