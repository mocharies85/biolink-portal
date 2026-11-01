export interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  clicks?: number;
  is_active?: number;
  is_spotlight?: number;
  is_header?: number;
  schedule_start?: string | null;
  schedule_end?: string | null;
  pin_code?: string | null;
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

export interface MessageItem {
  id: number;
  sender_name?: string;
  name?: string;
  email?: string;
  message: string;
  created_at: number;
}

export interface StoryItem {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number;
  created_at: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  is_pro?: boolean;
  views?: number;
  socials?: SocialLinks;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  theme?: string;
  bg_image?: string;
  featured_video_url?: string;
  show_featured_video?: number;
  featured_video_autoplay?: number;
  featured_video_title?: string;
  bg_music_url?: string;
  bg_music_title?: string;
}

export interface CurrentUser {
  id?: number | string;
  username: string;
  email: string;
  role?: string;
  is_pro?: number;
  last_username_change?: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  url: string;
}

export interface DetailedAnalyticsData {
  totalVisits: number;
  devices: {
    mobilePct: number;
    desktopPct: number;
    mobileCount: number;
    desktopCount: number;
  };
  referrers: {
    source: string;
    percentage: number;
    count: number;
  }[];
}

export interface RateCardItem {
  id: string;
  platform: string;
  deliverable: string;
  price: number;
  description?: string;
  sample_url?: string;
}

export interface MediaKitData {
  is_enabled: boolean;
  headline: string;
  about: string;
  contact_email: string;
  total_followers: number;
  monthly_impressions: number;
  engagement_rate: number;
  primary_niche: string;
  audience_country: string;
  rate_cards: RateCardItem[];
}

// 4 Free Themes + 5 PRO Themes
export const THEME_OPTIONS = [
  // --- 4 FREE THEMES ---
  { id: 'dark', name: 'Minimal Dark', preview: 'bg-neutral-900 border-neutral-700', isPro: false },
  { id: 'light', name: 'Clean White', preview: 'bg-slate-100 border-slate-300', isPro: false },
  { id: 'emerald', name: 'Forest Emerald', preview: 'bg-[#0a261e] border-emerald-700', isPro: false },
  { id: 'midnight', name: 'Midnight Navy', preview: 'bg-[#111827] border-sky-800', isPro: false },

  // --- 5 PRO THEMES ---
  { id: 'cyberpunk', name: 'Neon Cyberpunk', preview: 'bg-[#180a33] border-fuchsia-600', isPro: true },
  { id: 'sunset', name: 'Sunset Crimson', preview: 'bg-[#290e14] border-amber-600', isPro: true },
  { id: 'aurora', name: 'Neon Aurora', preview: 'bg-[#041824] border-cyan-500', isPro: true },
  { id: 'amethyst', name: 'Royal Amethyst', preview: 'bg-[#150724] border-purple-600', isPro: true },
  { id: 'gold', name: 'Obsidian Gold', preview: 'bg-[#241a04] border-amber-500', isPro: true },
];

export const THEME_STYLES: Record<string, {
  mockupBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}> = {
  // Free Styles
  dark: {
    mockupBg: 'bg-neutral-950',
    cardBg: 'bg-neutral-900/90',
    cardBorder: 'border-neutral-800',
    textPrimary: 'text-neutral-100',
    textSecondary: 'text-neutral-400',
    accent: 'text-emerald-400',
  },
  light: {
    mockupBg: 'bg-slate-50',
    cardBg: 'bg-white shadow-sm',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accent: 'text-indigo-600',
  },
  emerald: {
    mockupBg: 'bg-[#061a14]',
    cardBg: 'bg-[#0a261e]/90',
    cardBorder: 'border-emerald-900/60',
    textPrimary: 'text-emerald-100',
    textSecondary: 'text-emerald-400/80',
    accent: 'text-emerald-400',
  },
  midnight: {
    mockupBg: 'bg-[#0b0f19]',
    cardBg: 'bg-[#111827]/90',
    cardBorder: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: 'text-sky-400',
  },

  // PRO Styles
  cyberpunk: {
    mockupBg: 'bg-[#080312]',
    cardBg: 'bg-[#150a29]/90',
    cardBorder: 'border-fuchsia-900/60',
    textPrimary: 'text-fuchsia-100',
    textSecondary: 'text-fuchsia-300/70',
    accent: 'text-yellow-400',
  },
  sunset: {
    mockupBg: 'bg-[#18080a]',
    cardBg: 'bg-[#260e12]/90',
    cardBorder: 'border-amber-950/80',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-rose-300/80',
    accent: 'text-amber-400',
  },
  aurora: {
    mockupBg: 'bg-[#020e17]',
    cardBg: 'bg-[#072436]/90',
    cardBorder: 'border-cyan-900/60',
    textPrimary: 'text-cyan-100',
    textSecondary: 'text-cyan-300/70',
    accent: 'text-cyan-400',
  },
  amethyst: {
    mockupBg: 'bg-[#0d0317]',
    cardBg: 'bg-[#1e0a33]/90',
    cardBorder: 'border-purple-900/60',
    textPrimary: 'text-purple-100',
    textSecondary: 'text-purple-300/70',
    accent: 'text-purple-400',
  },
  gold: {
    mockupBg: 'bg-[#140f02]',
    cardBg: 'bg-[#2b1f06]/90',
    cardBorder: 'border-amber-900/60',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-amber-300/70',
    accent: 'text-amber-400',
  },
};