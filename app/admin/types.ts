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
  { id: 'dark', name: 'Minimal Dark', preview: 'bg-neutral-900 border-neutral-700', isPro: false },
  { id: 'light', name: 'Clean White', preview: 'bg-slate-100 border-slate-300', isPro: false },
  { id: 'emerald', name: 'Forest Emerald', preview: 'bg-[#0a261e] border-emerald-700', isPro: false },
  { id: 'midnight', name: 'Midnight Navy', preview: 'bg-[#111827] border-sky-800', isPro: false },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', preview: 'bg-[#180a33] border-fuchsia-600', isPro: true },
  { id: 'sunset', name: 'Sunset Crimson', preview: 'bg-[#290e14] border-amber-600', isPro: true },
  { id: 'aurora', name: 'Neon Aurora', preview: 'bg-[#041824] border-cyan-500', isPro: true },
  { id: 'amethyst', name: 'Royal Amethyst', preview: 'bg-[#150724] border-purple-600', isPro: true },
  { id: 'gold', name: 'Obsidian Gold', preview: 'bg-[#241a04] border-amber-500', isPro: true },
];

export const THEME_STYLES: Record<string, any> = {
  dark: { bg: 'bg-neutral-950', text: 'text-neutral-150', card: 'bg-neutral-900/80 border-neutral-800' },
  light: { bg: 'bg-slate-50', text: 'text-neutral-900', card: 'bg-white/90 border-slate-200' },
  emerald: { bg: 'bg-[#071a14]', text: 'text-emerald-100', card: 'bg-[#0e2a21]/80 border-emerald-800/40' },
  midnight: { bg: 'bg-[#0b0f19]', text: 'text-sky-100', card: 'bg-[#111827]/80 border-sky-900/40' },
  cyberpunk: { bg: 'bg-[#0f051d]', text: 'text-fuchsia-100', card: 'bg-[#1c0b36]/80 border-fuchsia-800/40' },
  sunset: { bg: 'bg-[#1a070a]', text: 'text-rose-100', card: 'bg-[#2e0e14]/80 border-rose-800/40' },
  aurora: { bg: 'bg-[#020e17]', text: 'text-cyan-100', card: 'bg-[#062030]/80 border-cyan-800/40' },
  amethyst: { bg: 'bg-[#0d0417]', text: 'text-purple-100', card: 'bg-[#1a082e]/80 border-purple-800/40' },
  gold: { bg: 'bg-[#140e02]', text: 'text-amber-100', card: 'bg-[#291c04]/80 border-amber-800/40' },
};