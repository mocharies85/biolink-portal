'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Link2,
  MessageSquare,
  BarChart3,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  Lock,
  TrendingUp,
  Smartphone,
  Globe,
  X,
  HelpCircle,
  MessageCircle,
  LogOut,
  Camera,
  Upload,
  Radio,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Link as LinkIcon,
  Play,
  Pause,
  Sparkles,
  Flame,
  QrCode,
  Download,
  Share2,
  Palette
} from 'lucide-react';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  clicks?: number;
  is_active?: number;
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

interface MessageItem {
  id: number;
  sender_name?: string;
  name?: string;
  email?: string;
  message: string;
  created_at: number;
}

interface StoryItem {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number;
  created_at: string;
}

interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  views?: number;
  socials?: SocialLinks;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  theme?: string;
  bg_image?: string;
}

interface CurrentUser {
  username: string;
  email: string;
  role?: string;
  is_pro?: number;
}

interface MusicTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  url: string;
}

interface DetailedAnalyticsData {
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

const THEME_OPTIONS = [
  { id: 'dark', name: 'Minimal Dark', preview: 'bg-neutral-900 border-neutral-700', isPro: false },
  { id: 'light', name: 'Clean White', preview: 'bg-slate-100 border-slate-300', isPro: false },
  { id: 'emerald', name: 'Forest Emerald', preview: 'bg-[#0a261e] border-emerald-700', isPro: false },
  { id: 'midnight', name: 'Midnight Navy', preview: 'bg-[#111827] border-sky-800', isPro: false },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', preview: 'bg-[#180a33] border-fuchsia-600', isPro: true },
  { id: 'sunset', name: 'Sunset Crimson', preview: 'bg-[#290e14] border-amber-600', isPro: true },
];

const THEME_STYLES: Record<string, {
  mockupBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}> = {
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
};

const compressImage = (
  file: File, 
  maxWidth = 1080, 
  maxHeight = 1920, 
  quality = 0.75, 
  forceJpeg = false
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (forceJpeg) {
          resolve(canvas.toDataURL('image/jpeg', quality));
          return;
        }

        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

const trimAndCompressAudio = async (file: File, maxDurationSeconds: number): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const duration = Math.min(decodedBuffer.duration, maxDurationSeconds);
  const sampleRate = 22050;
  const numChannels = 1;
  const numFrames = Math.floor(duration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, numFrames, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();

  const numOfChan = renderedBuffer.numberOfChannels;
  const length = renderedBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(renderedBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  const blob = new Blob([view.buffer], { type: 'audio/wav' });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const customAudioInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'themes' | 'stories' | 'inbox' | 'analytics'>('profile');

  const [profile, setProfile] = useState<ProfileData>({
    name: 'New Creator',
    tagline: 'Digital Creator',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    views: 0,
    socials: {},
    og_title: '',
    og_description: '',
    og_image: '',
    theme: 'dark',
    bg_image: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsSpotlight, setNewIsSpotlight] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [selectedPhotoDuration, setSelectedPhotoDuration] = useState<number>(25);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyAudioUrl, setStoryAudioUrl] = useState('');
  const [storyLinkUrl, setStoryLinkUrl] = useState('');
  const [postingStory, setPostingStory] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const [compressingStory, setCompressingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  // Dynamic Music Library (Read-only for creators, managed via /superadmin)
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [selectedTrackTitle, setSelectedTrackTitle] = useState<string>('');
  const [processingAudio, setProcessingAudio] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);
  const [detailedData, setDetailedData] = useState<DetailedAnalyticsData | null>(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  const activeUsername = currentUser?.username || 'creator';
  const isProUser = currentUser?.is_pro === 1;

  const viewsCount = profile.views || 0;
  const clicksCount = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  const currentThemeKey = profile.theme && THEME_STYLES[profile.theme] ? profile.theme : 'dark';
  const activeTheme = THEME_STYLES[currentThemeKey];

  const plannedDuration = storyMediaType === 'video'
    ? 60
    : (isProUser ? selectedPhotoDuration : 10);

  const liveProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${activeUsername}`
    : `https://link.curiolot.com/${activeUsername}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(liveProfileUrl)}`;

  useEffect(() => {
    const storedUser = sessionStorage.getItem('curiolot_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchProfile = async () => {
    if (!activeUsername) return;
    try {
      const res = await fetch(`/api/profile?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          let parsedSocials = {};
          if (typeof data.profile.socials === 'string') {
            try { parsedSocials = JSON.parse(data.profile.socials); } catch {}
          } else if (typeof data.profile.socials === 'object' && data.profile.socials !== null) {
            parsedSocials = data.profile.socials;
          }

          setProfile({
            name: data.profile.name || activeUsername,
            tagline: data.profile.tagline || 'Digital Creator',
            bio: data.profile.bio || '',
            avatar: data.profile.avatar || profile.avatar,
            views: data.profile.views || 0,
            socials: parsedSocials,
            og_title: data.profile.og_title || '',
            og_description: data.profile.og_description || '',
            og_image: data.profile.og_image || '',
            theme: data.profile.theme || 'dark',
            bg_image: data.profile.bg_image || ''
          });
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const fetchLinks = async () => {
    if (!activeUsername) return;
    setLoadingLinks(true);
    try {
      const res = await fetch(`/api/links?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error('Failed to load links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchMusicTracks = async () => {
    setLoadingMusic(true);
    try {
      const res = await fetch('/api/music');
      if (res.ok) {
        const data = await res.json();
        setMusicTracks(Array.isArray(data.tracks) ? data.tracks : []);
      }
    } catch (err) {
      console.error('Failed to load music tracks:', err);
    } finally {
      setLoadingMusic(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeUsername) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchStories = async () => {
    if (!activeUsername) return;
    setLoadingStories(true);
    try {
      const res = await fetch(`/api/stories?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchDetailedAnalytics = async () => {
    if (!activeUsername) return;
    setLoadingDetailed(true);
    try {
      const res = await fetch(`/api/views?username=${activeUsername}&analytics=true`);
      if (res.ok) {
        const json = await res.json();
        setDetailedData(json);
      }
    } catch (err) {
      console.error('Failed to load detailed analytics:', err);
    } finally {
      setLoadingDetailed(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchLinks();
      fetchMessages();
      fetchStories();
      fetchMusicTracks();
    }
  }, [currentUser]);

  const handleTogglePreview = async (track: MusicTrack, e?: React.MouseEvent) => {
    // 1. KUNCI UTAMA: Hentikan rembetan klik (event bubbling) & cegah submit form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!previewAudioRef.current) return;
    const audio = previewAudioRef.current;

    // Jika lagu yang sama sedang diputar, pause
    if (previewingTrackId === track.id) {
      audio.pause();
      setPreviewingTrackId(null);
      return;
    }

    // 2. Aktifkan mode playback untuk iOS / Safari
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch {}
    }

    try {
      // 3. Muat dan putar audio
      audio.pause();
      audio.currentTime = 0;
      audio.src = track.url;
      audio.volume = 1.0;
      audio.load();

      setPreviewingTrackId(track.id);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.warn('Audio preview playback blocked or interrupted:', err);
      setPreviewingTrackId(null);
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setStoryAudioUrl(track.url);
    setSelectedTrackTitle(track.title);
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewingTrackId(null);
  };

  const handleRemoveTrack = () => {
    setStoryAudioUrl('');
    setSelectedTrackTitle('');
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewingTrackId(null);
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Otomatis mengikuti opsi durasi yang dipilih (10s, 25s, 45s, atau 60s)
    const maxAllowedDuration = plannedDuration;
    setProcessingAudio(true);

    try {
      const trimmedBase64 = await trimAndCompressAudio(file, maxAllowedDuration);
      setStoryAudioUrl(trimmedBase64);
      setSelectedTrackTitle(`${file.name.replace(/\.[^/.]+$/, '')} (${maxAllowedDuration}s auto-trimmed)`);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    } catch (err) {
      console.error('Failed to process custom audio:', err);
      alert('Failed to process audio file. Please choose a standard MP3 or WAV.');
    } finally {
      setProcessingAudio(false);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setProfile((prev) => ({ ...prev, avatar: compressed }));
      } catch (err) {
        console.error('Error compressing avatar:', err);
        alert('Failed to process profile avatar.');
      }
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 418, 0.70, true);
      setProfile((prev) => ({ ...prev, og_image: compressed }));
    } catch (err) {
      console.error('Error processing OG image:', err);
      alert('Failed to process social share image.');
    }
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const compressed = await compressImage(file, 1920, 1080, 0.8);
      setProfile((prev) => ({ ...prev, bg_image: compressed }));
    } catch (err) {
      console.error('Error processing background wallpaper:', err);
      alert('Failed to process wallpaper.');
    }
  };

  const handleStoryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      if (!isProUser) {
        setShowUpgradeModal(true);
        e.target.value = '';
        return;
      }

      if (file.size > 35 * 1024 * 1024) {
        alert('Video file is too large. Please choose a video under 35MB for optimal mobile streaming.');
        e.target.value = '';
        return;
      }

      setStoryMediaType('video');
      setCompressingStory(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', activeUsername);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setStoryMediaUrl(data.url);
        } else {
          const err = await res.json().catch(() => null);
          alert(err?.error || 'Failed to upload video to Cloudflare R2.');
        }
      } catch (err) {
        console.error('Error uploading video:', err);
        alert('Network error while uploading video.');
      } finally {
        setCompressingStory(false);
      }
    } else {
      setStoryMediaType('image');
      setCompressingStory(true);
      try {
        const compressed = await compressImage(file, 1080, 1920, 0.75);
        setStoryMediaUrl(compressed);
      } catch (err) {
        console.error('Error compressing story image:', err);
        alert('Failed to process story image. Please use JPG or PNG format.');
      } finally {
        setCompressingStory(false);
      }
    }
    e.target.value = '';
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileSavedSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          ...profile,
          socials: profile.socials || {}
        }),
      });

      if (res.ok) {
        setProfileSavedSuccess(true);
        setTimeout(() => setProfileSavedSuccess(false), 3000);
      } else {
        alert('Failed to save profile settings.');
      }
    } catch {
      alert('Network error while saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    if (!isProUser && links.length >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    setAddingLink(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          title: newTitle.trim(),
          url: newUrl.trim(),
          description: newDesc.trim(),
          is_spotlight: isProUser && newIsSpotlight ? 1 : 0
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setNewDesc('');
        setNewIsSpotlight(false);
        fetchLinks();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add link.');
      }
    } catch {
      alert('Network error while adding link.');
    } finally {
      setAddingLink(false);
    }
  };

  const handleToggleSpotlight = async (link: LinkItem) => {
    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    const nextSpotlight = link.is_spotlight === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.id,
          username: activeUsername,
          is_spotlight: nextSpotlight
        })
      });

      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, is_spotlight: nextSpotlight } : l))
        );
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to toggle spotlight status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating spotlight.');
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyMediaType === 'video' && !isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    if (!storyMediaUrl.trim()) {
      alert('Please choose an image/video or enter a media URL first.');
      return;
    }

    setPostingStory(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          media_url: storyMediaUrl,
          caption: storyCaption.trim(),
          audio_url: storyAudioUrl.trim() || null,
          link_url: storyLinkUrl.trim() || null,
          duration: plannedDuration,
        }),
      });

      if (res.ok) {
        setStorySuccess(true);
        setStoryMediaUrl('');
        setStoryCaption('');
        setStoryAudioUrl('');
        setStoryLinkUrl('');
        setSelectedTrackTitle('');
        fetchStories();
        setTimeout(() => setStorySuccess(false), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to publish story.');
      }
    } catch {
      alert('Network error while publishing story.');
    } finally {
      setPostingStory(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to remove this story?')) return;
    setDeletingStoryId(storyId);

    try {
      const res = await fetch(`/api/stories?id=${encodeURIComponent(storyId)}&username=${encodeURIComponent(activeUsername)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to delete story.');
      }
    } catch {
      alert('Network error while deleting story.');
    } finally {
      setDeletingStoryId(null);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to remove this link?')) return;

    try {
      const res = await fetch(`/api/links?id=${id}&username=${activeUsername}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== id));
      } else {
        alert('Failed to delete link.');
      }
    } catch {
      alert('Network error while deleting link.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('curiolot_auth_user');
    router.push('/login');
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSendingSupport(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          email: currentUser?.email || '',
          message: supportMessage.trim(),
        }),
      });

      if (res.ok) {
        setSupportSentSuccess(true);
        setSupportMessage('');
        setTimeout(() => {
          setSupportSentSuccess(false);
          setShowSupportModal(false);
        }, 1800);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch {
      alert('Network error. Failed to reach support server.');
    } finally {
      setSendingSupport(false);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${activeUsername}-biolink-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      <audio 
  ref={previewAudioRef} 
  preload="auto"
  playsInline
  crossOrigin="anonymous"
  onEnded={() => setPreviewingTrackId(null)} 
/>

      {/* Sidebar Navigation (Clean: No Music Manager) */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain shrink-0" 
            />
            <div className="truncate">
              <p className="font-bold text-sm text-white truncate">@{activeUsername}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isProUser ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-[11px] text-neutral-400 font-medium">
                  {isProUser ? 'PRO Creator' : 'Free Creator'}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile &amp; Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'links'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4" />
                <span>Links &amp; Content</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px]">
                {links.length}
              </span>
            </button>

            {/* Tab Themes & Styling */}
            <button
              onClick={() => setActiveTab('themes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'themes'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Themes &amp; Styling</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'stories'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>24h Stories</span>
              </div>
              {stories.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {stories.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'inbox'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Messaging &amp; Inbox</span>
              </div>
              {messages.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Global Insights</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-neutral-800 mt-6">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Generate QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-emerald-500/40 flex items-center justify-center gap-2 transition"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Need Help? Contact Admin</span>
          </button>

          <a
            href={`/${activeUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-xs font-semibold text-rose-400 flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* TAB 1: Profile & Bio */}
        {activeTab === 'profile' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Profile &amp; Bio</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Customize how your bio hub appears to your visitors.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-2">Profile Avatar</label>
                  <div className="flex items-center gap-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="relative group">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/40 shadow-lg group-hover:opacity-80 transition"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                        title="Upload new avatar"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <p className="text-xs font-bold text-white">Upload New Image</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Photos are automatically optimized and compressed.
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Choose File</span>
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Display Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Tagline / Role</label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Bio Description</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition resize-none"
                    placeholder="Tell your audience about yourself or your creations..."
                  />
                </div>

                {/* Social Media Icons Input */}
                <div className="pt-4 border-t border-neutral-800">
                  <label className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Social Media Icons Bar</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Add your social links or usernames. Icons will automatically display directly below your bio on your live profile.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Instagram (@username)</label>
                      <input
                        type="text"
                        placeholder="e.g. yourname"
                        value={profile.socials?.instagram || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, instagram: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">WhatsApp (Country code + number)</label>
                      <input
                        type="text"
                        placeholder="e.g. 15551234567"
                        value={profile.socials?.whatsapp || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, whatsapp: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">TikTok (@username)</label>
                      <input
                        type="text"
                        placeholder="e.g. yourname"
                        value={profile.socials?.tiktok || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, tiktok: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">YouTube Channel URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@yourchannel"
                        value={profile.socials?.youtube || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, youtube: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">X / Twitter (@username)</label>
                      <input
                        type="text"
                        placeholder="e.g. yourhandle"
                        value={profile.socials?.x || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, x: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">GitHub (username)</label>
                      <input
                        type="text"
                        placeholder="e.g. yourgithub"
                        value={profile.socials?.github || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, github: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Social Share Card & OpenGraph */}
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Custom Social Share Card &amp; SEO</span>
                      {!isProUser && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                          PRO
                        </span>
                      )}
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Customize the rich snippet banner and metadata shown when your bio link is shared on WhatsApp, Telegram, or X.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Social Card Title</label>
                      <input
                        type="text"
                        disabled={!isProUser}
                        placeholder="e.g. Official Creator Portfolio & Hub"
                        value={profile.og_title || ''}
                        onChange={(e) => setProfile({ ...profile, og_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Social Card Description</label>
                      <input
                        type="text"
                        disabled={!isProUser}
                        placeholder="e.g. Explore my latest projects, digital store, and creative works."
                        value={profile.og_description || ''}
                        onChange={(e) => setProfile({ ...profile, og_description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Social Banner Image (1200x630)</label>
                      <div className="flex items-center gap-3">
                        {profile.og_image && (
                          <img
                            src={profile.og_image}
                            alt="OG Preview"
                            className="w-20 h-11 object-cover rounded-lg border border-neutral-700"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isProUser) {
                              setShowUpgradeModal(true);
                              return;
                            }
                            ogFileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{profile.og_image ? 'Change Banner' : 'Upload Banner'}</span>
                        </button>
                        <input
                          type="file"
                          ref={ogFileInputRef}
                          accept="image/*"
                          onChange={handleOgImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between">
                {profileSavedSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Profile &amp; Socials saved successfully!
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Themes & Styling */}
        {activeTab === 'themes' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <span>Themes &amp; Visual Styling</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Personalize your bio page appearance with curated color palettes and custom wallpapers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-6">
              
              {/* Preset Color Themes */}
              <div>
                <label className="text-xs font-bold text-white block mb-2">Preset Color Themes</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((thm) => {
                    const isSelected = (profile.theme || 'dark') === thm.id;
                    const isLocked = thm.isPro && !isProUser;

                    return (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => {
                          setProfile((prev) => ({ ...prev, theme: thm.id }));
                          if (thm.isPro && !isProUser) {
                            setShowUpgradeModal(true);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-2 relative overflow-hidden ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-neutral-800'
                            : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                        }`}
                      >
                        <div className={`w-full h-12 rounded-xl border ${thm.preview} flex items-center justify-center`}>
                          {isLocked && <Lock className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{thm.name}</span>
                          {thm.isPro && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[8px] font-black">
                              PRO
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Background Wallpaper (PRO Only) */}
              <div className="pt-5 border-t border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Custom Background Wallpaper</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" /> PRO
                      </span>
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Upload your own high-resolution backdrop image for your bio page.
                    </p>
                  </div>
                  {isProUser && profile.bg_image && (
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, bg_image: '' }))}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div 
                    onClick={() => {
                      if (!isProUser) setShowUpgradeModal(true);
                    }}
                    className={`w-24 h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 ${
                      !isProUser ? 'cursor-pointer hover:border-amber-500/40' : ''
                    }`}
                  >
                    {isProUser && profile.bg_image ? (
                      <img src={profile.bg_image} alt="Custom Background" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-600 gap-1">
                        <ImageIcon className="w-5 h-5 text-neutral-600" />
                        <span className="text-[8px] font-semibold text-neutral-500">Default (Free)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isProUser) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        bgFileInputRef.current?.click();
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                        isProUser
                          ? 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                          : 'bg-neutral-900 border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                      }`}
                    >
                      {isProUser ? (
                        <>
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{profile.bg_image ? 'Change Wallpaper' : 'Upload Wallpaper'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Unlock Wallpaper (PRO)</span>
                        </>
                      )}
                    </button>
                    {!isProUser && (
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        Wallpaper is locked on Free tier. Profile uses standard theme background.
                      </p>
                    )}
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {profileSavedSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Theme styling saved successfully!
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const selectedThemeObj = THEME_OPTIONS.find((t) => t.id === (profile.theme || 'dark'));
                    if (selectedThemeObj?.isPro && !isProUser) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    handleSaveProfile();
                  }}
                  disabled={savingProfile}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Apply & Save Theme'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: Links & Content */}
        {activeTab === 'links' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-white">Links &amp; Content</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage your external links, portfolios, and highlight priority content with Spotlight.
                </p>
              </div>
              {!isProUser && (
                <div className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2 shrink-0">
                  <span>Free Limit: {links.length}/3 Links</span>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="underline font-bold hover:text-amber-300"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleAddLink} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Link</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Link Title (e.g. My Portfolio)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="url"
                  required
                  placeholder="https://yourlink.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Description or subtitle (optional, e.g. Free tools for digital creators)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Spotlight Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${newIsSpotlight ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      Spotlight Glow Animation
                      {!isProUser && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      Highlight this link with an animated gold neon glow and HOT badge to boost clicks.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isProUser) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    setNewIsSpotlight(!newIsSpotlight);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative flex items-center ${
                    newIsSpotlight ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newIsSpotlight ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={addingLink}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>{addingLink ? 'Adding...' : 'Add Link to Bio'}</span>
              </button>
            </form>

            <div className="flex flex-col gap-2.5">
              {loadingLinks ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Loading links...</p>
              ) : links.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <Link2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No links added yet. Create your first link above.</p>
                </div>
              ) : (
                links.map((link) => {
                  const isSpotlight = link.is_spotlight === 1;

                  return (
                    <div
                      key={link.id}
                      className={`p-4 rounded-2xl bg-neutral-900 border flex items-center justify-between gap-4 transition ${
                        isSpotlight
                          ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{link.title}</p>
                          {isSpotlight && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5" /> SPOTLIGHT
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">{link.description}</p>
                        )}
                        <p className="text-[10px] text-neutral-500 truncate mt-0.5">{link.url}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSpotlight(link)}
                          title={isSpotlight ? 'Disable Spotlight effect' : 'Enable Spotlight Glow effect (PRO)'}
                          className={`p-2 rounded-xl transition ${
                            isSpotlight
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                              : 'bg-neutral-800 text-neutral-500 hover:text-amber-400'
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                        </button>

                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">{link.clicks || 0}</span>
                          <span className="text-[10px] text-neutral-500">clicks</span>
                        </div>

                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Stories */}
        {activeTab === 'stories' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>24h Profile Stories</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Status
                  </span>
                </h1>
                
                <span className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold border flex items-center gap-1.5 w-fit ${
                  isProUser 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}>
                  {isProUser ? (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>PRO Tier: 25s, 45s, 60s Photo / 60s Video</span>
                    </>
                  ) : (
                    <span>Free Tier: 10s Photo Only</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Post visual updates with background soundtracks and clickable link stickers that automatically expire after 24 hours.
              </p>
            </div>

            <form onSubmit={handleCreateStory} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Publish New Story</span>
                </h3>

                <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setStoryMediaType('image')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      storyMediaType === 'image'
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Photo ({isProUser ? `${selectedPhotoDuration}s` : '10s'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isProUser) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      setStoryMediaType('video');
                    }}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      storyMediaType === 'video'
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video (60s)</span>
                    {!isProUser && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* FITUR BARU: TOMBOL PILIHAN WAKTU TAYANG FOTO (25s, 45s, 60s) */}
              {storyMediaType === 'image' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Photo Display Duration</span>
                      {!isProUser && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isProUser ? 'Select how long your photo story remains on screen.' : 'Free tier is fixed to 10 seconds. Upgrade to unlock longer durations.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {[25, 45, 60].map((dur) => {
                      const isSelected = isProUser && selectedPhotoDuration === dur;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => {
                            if (!isProUser) {
                              setShowUpgradeModal(true);
                              return;
                            }
                            setSelectedPhotoDuration(dur);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isSelected
                              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                              : isProUser
                              ? 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-amber-500/40'
                              : 'bg-neutral-900/60 border border-neutral-800 text-neutral-500 hover:border-amber-500/30'
                          }`}
                        >
                          {!isProUser && <Lock className="w-2.5 h-2.5 text-amber-400/80" />}
                          <span>{dur}s</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                  {storyMediaUrl ? (
                    storyMediaType === 'video' ? (
                      <video src={storyMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={storyMediaUrl} alt="Story preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    storyMediaType === 'video' ? (
                      <VideoIcon className="w-8 h-8 text-neutral-600" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    )
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1 w-full text-center sm:text-left">
                  <p className="text-xs font-bold text-white">
                    {storyMediaType === 'video' ? 'Story Video Clip (PRO Only)' : `Story Photo / Poster (${plannedDuration}s)`}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {storyMediaType === 'video'
                      ? 'Video display duration is automatically set to 60 seconds.'
                      : `Photo display duration is set to ${plannedDuration} seconds.`}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <button
                      type="button"
                      disabled={compressingStory}
                      onClick={() => storyFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{compressingStory ? 'Processing Media...' : 'Upload from Device'}</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={storyFileInputRef}
                    accept={storyMediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleStoryMediaUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Or paste direct media URL ({storyMediaType === 'video' ? 'Video .mp4' : 'Image .jpg/.png'})
                </label>
                <input
                  type="url"
                  placeholder={storyMediaType === 'video' ? 'https://example.com/video.mp4' : 'https://images.unsplash.com/photo-...'}
                  value={storyMediaUrl.startsWith('data:') ? '' : storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Story Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Launching our new design project! Tap the link below."
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 font-semibold block mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clickable Story Link Sticker (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://yourshop.com or https://youtube.com/..."
                  value={storyLinkUrl}
                  onChange={(e) => setStoryLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Dynamic Soundtracks from Superadmin Database */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-neutral-300 font-semibold flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Background Soundtrack (Creator Music Library)</span>
                  </label>
                  {storyAudioUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveTrack}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Remove Music
                    </button>
                  )}
                </div>

                {selectedTrackTitle ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-semibold truncate">Selected: {selectedTrackTitle}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal shrink-0">Attached to story</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border border-neutral-800 rounded-xl bg-neutral-950">
                    {loadingMusic ? (
                      <p className="text-[11px] text-neutral-500 p-3 col-span-2 text-center">Loading soundtracks...</p>
                    ) : musicTracks.length === 0 ? (
                      <p className="text-[11px] text-neutral-500 p-3 col-span-2 text-center">No soundtracks available in library.</p>
                    ) : (
                      musicTracks.map((track) => (
                      <div
                        key={track.id}
                        className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 hover:border-neutral-700 transition"
                      >
                        <div className="truncate flex-1">
                          <p className="text-xs font-medium text-white truncate">{track.title}</p>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">
                            {track.category} • {track.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Tombol Preview Audio (Sudah Anti-Macet di Ponsel) */}
                          <button
                            type="button"
                            onClick={(e) => handleTogglePreview(track, e)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                            title={previewingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                          >
                            {previewingTrackId === track.id ? (
                              <Pause className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Play className="w-3 h-3 text-neutral-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectTrack(track)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[10px] transition"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))

                    {/* Custom Audio Upload */}
                    <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-dashed border-neutral-700 hover:border-emerald-500/50 flex items-center justify-between gap-2 transition col-span-1 sm:col-span-2">
                      <div className="truncate flex-1">
                        <p className="text-xs font-medium text-neutral-200 flex items-center gap-1.5 truncate">
                          <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Custom Audio</span>
                        </p>
                        <span className="text-[9px] text-neutral-400 block mt-0.5">
                          {isProUser ? `Auto-trimmed to ${plannedDuration}s (PRO)` : 'Auto-trimmed to 10s (Free)'}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={processingAudio}
                        onClick={() => customAudioInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-750 text-emerald-400 hover:text-emerald-300 font-bold text-[10px] transition disabled:opacity-50 shrink-0"
                      >
                        {processingAudio ? 'Trimming...' : 'Upload MP3'}
                      </button>

                      <input
                        type="file"
                        ref={customAudioInputRef}
                        accept="audio/*"
                        onChange={handleCustomAudioUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {storySuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Story published successfully ({plannedDuration}s)! Active for 24 hours.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={postingStory || !storyMediaUrl || compressingStory}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
              >
                <Radio className="w-4 h-4" />
                <span>{postingStory ? 'Publishing Story...' : `Publish Story (${plannedDuration}s)`}</span>
              </button>
            </form>

            <div>
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
                Active Stories ({stories.length})
              </h3>
              {loadingStories ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Checking active stories...</p>
              ) : stories.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No active stories right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stories.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex gap-3 items-center justify-between hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-3 truncate flex-1">
                        <img
                          src={st.media_url}
                          alt="Story thumb"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-700"
                        />
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active Now
                            </span>
                            <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                              {st.duration ? `${st.duration}s` : '10s'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-200 truncate mt-0.5">
                            {st.caption || 'No caption'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={deletingStoryId === st.id}
                        onClick={() => handleDeleteStory(st.id)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition shrink-0 disabled:opacity-50"
                        title="Delete story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Messages */}
        {activeTab === 'inbox' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Audience Messages</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Read direct inquiries and messages submitted by your audience.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {loadingMessages ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Your inbox is empty. No messages received yet.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">
                        {msg.name || msg.sender_name || 'Anonymous Visitor'}
                      </p>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {msg.email && (
                      <p className="text-[11px] text-neutral-400">{msg.email}</p>
                    )}
                    <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-850 mt-1">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Analytics */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Audience Insights</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Profile and link performance for @{activeUsername}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Total Views</span>
                <span className="text-2xl font-bold text-white block mt-2">{viewsCount.toLocaleString()}</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Link Clicks</span>
                <span className="text-2xl font-bold text-white block mt-2">
                  {clicksCount}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Account Type</span>
                <span
                  className={`text-xl font-bold block mt-2 ${
                    isProUser ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isProUser ? 'PRO Tier' : 'Free Tier'}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Detailed Link Analytics</h3>
                    {!isProUser && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PRO ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Analyze individual link CTR, device breakdown, and audience referral sources.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isProUser) {
                    fetchDetailedAnalytics();
                    setShowDetailedInsights(true);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                  isProUser
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isProUser ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Open Analytics Dashboard</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Pro Insights</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Right Side Mockup Phone Preview */}
      <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
        <div 
          className={`w-full max-w-[280px] h-[560px] border-[6px] border-neutral-800 rounded-[40px] shadow-2xl p-4 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${activeTheme.mockupBg}`}
          style={
            (isProUser && profile.bg_image)
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

            {/* Social Icons Bar in Mockup */}
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
              </div>
            )}

            {/* Links in Mockup with Dynamic Theme Styling */}
            <div className="w-full flex flex-col gap-2 mt-2">
              {links.map((l) => {
                const isSpotlight = l.is_spotlight === 1;

                return (
                  <div
                    key={l.id}
                    className={`relative w-full py-2.5 px-3 rounded-xl border text-[10px] text-center truncate shadow-sm transition backdrop-blur-sm ${
                      isSpotlight
                        ? 'bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-amber-500/10'
                        : `${activeTheme.cardBg} ${activeTheme.cardBorder}${activeTheme.textPrimary}`
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

      {/* QR Code Generator Modal */}
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

            <h3 className="text-base font-bold text-white">Profile QR Code</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
              Scan to open <strong>@{activeUsername}</strong>'s biolink hub instantly.
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-xl mx-auto shadow-lg shadow-amber-500/25">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-white mt-3">Upgrade to Curiolot Link PRO</h3>
              
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-3xl font-black text-white tracking-tight">$3</span>
                <span className="text-xs text-neutral-400 font-medium">/ month</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Cancel anytime
                </span>
              </div>
              
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Supercharge your biolink with creator tools designed to boost engagement, branding, and click conversions.
              </p>
            </div>

            {/* List Fasilitas Unggulan PRO */}
            <div className="my-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3 text-xs text-neutral-300">
              
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Custom Wallpapers &amp; PRO Themes:</strong> Upload high-res background backdrops and access premium themes (Neon Cyberpunk &amp; Sunset Crimson).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Custom Social Share Card &amp; SEO:</strong> Dedicated 1200x630 rich banner thumbnail, custom title, and snippet description on WhatsApp, Telegram, and X.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Spotlight Glow &amp; 'HOT' Badge:</strong> Animated gold neon glow and hot badge on priority links to maximize click-through rates (CTR).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">60s Video &amp; 25s Photo 24h Stories:</strong> Full 60s video streaming via Cloudflare R2, 25s photo duration (Free: 10s only), and custom audio upload.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Unlimited Links &amp; Content:</strong> Add unlimited portfolio, store, and social links (Free tier is limited to 3 links).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Deep Real-Time Analytics:</strong> Track individual link CTR, device breakdown (iOS/Android vs Desktop), and top live referral sources.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Verified PRO Badge:</strong> Exclusive gold verification badge displayed beside your profile name to build trust and credibility.
                </div>
              </div>

            </div>

            {/* Kotak Info Aktivasi Instan */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-neutral-300 leading-relaxed mb-5">
              💡 <strong>Instant Activation:</strong> When subscribing via Ko-fi, please keep your account email (<strong>{currentUser?.email}</strong>) or write <strong>@{activeUsername}</strong> in the message box. Your PRO features will unlock automatically!
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Cancel
              </button>
              <a
                href="https://ko-fi.com/cycrack"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowUpgradeModal(false)}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <span>Get PRO Access ($3/mo)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Detailed Insights Modal */}
      {showDetailedInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Pro Performance Dashboard
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      PRO Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Real-time engagement breakdown for @{activeUsername}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedInsights(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Average CTR</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-1">
                  {viewsCount > 0 ? Math.min(100, (clicksCount / viewsCount) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Total Active Links</span>
                <p className="text-lg font-extrabold text-white mt-1">{links.length} Links</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Audience Retention</span>
                <p className="text-lg font-extrabold text-amber-400 mt-1">High (Top 10%)</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-neutral-300 mb-2.5">Individual Link Performance</h4>
              <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
                <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400">
                  <div className="col-span-7">Link Title &amp; URL</div>
                  <div className="col-span-3 text-right">Clicks</div>
                  <div className="col-span-2 text-right">CTR</div>
                </div>
                <div className="divide-y divide-neutral-800">
                  {links.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">No links added yet.</div>
                  ) : (
                    links.map((link) => {
                      const linkClicks = link.clicks || 0;
                      const rawCtr = viewsCount > 0 ? (linkClicks / viewsCount) * 100 : 0;
                      const linkCtr = Math.min(100, rawCtr).toFixed(1);

                      return (
                        <div key={link.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-neutral-900/30 transition">
                          <div className="col-span-7 truncate pr-2">
                            <p className="font-medium text-white truncate">{link.title}</p>
                            {link.description && (
                              <p className="text-[11px] text-neutral-400 truncate">{link.description}</p>
                            )}
                            <p className="text-[10px] text-neutral-500 truncate">{link.url}</p>
                          </div>
                          <div className="col-span-3 text-right font-bold text-neutral-200">
                            {linkClicks} clicks
                          </div>
                          <div className="col-span-2 text-right font-bold text-emerald-400">
                            {linkCtr}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-neutral-400" /> Devices Breakdown
                  </span>
                  {detailedData && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      {detailedData.totalVisits} visits logged
                    </span>
                  )}
                </h5>

                {loadingDetailed ? (
                  <p className="text-[11px] text-neutral-500 py-5 text-center">Loading device stats...</p>
                ) : !detailedData || detailedData.totalVisits === 0 ? (
                  <div className="py-5 text-center text-[11px] text-neutral-500 leading-relaxed">
                    No visitor data recorded yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-[11px]">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Mobile (iOS &amp; Android)</span>
                      <span className="font-bold text-white">{detailedData.devices.mobilePct}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${detailedData.devices.mobilePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-neutral-300 mt-1">
                      <span>Desktop &amp; Tablets</span>
                      <span className="font-bold text-white">{detailedData.devices.desktopPct}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${detailedData.devices.desktopPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-neutral-400" /> Top Referrers
                  </span>
                  {detailedData && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      Live Traffic Sources
                    </span>
                  )}
                </h5>

                {loadingDetailed ? (
                  <p className="text-[11px] text-neutral-500 py-5 text-center">Loading traffic sources...</p>
                ) : !detailedData || detailedData.referrers.length === 0 ? (
                  <div className="py-5 text-center text-[11px] text-neutral-500 leading-relaxed">
                    No traffic sources recorded yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-[11px]">
                    {detailedData.referrers.map((ref, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-neutral-300">
                          <span className="font-medium text-neutral-200">{ref.source}</span>
                          <span className="font-bold text-white">
                            {ref.percentage}% <span className="text-[10px] text-neutral-500 font-normal">({ref.count})</span>
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${ref.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailedInsights(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Contact Admin Support</h3>
                  <p className="text-[11px] text-neutral-400">Ask questions regarding PRO features or assistance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportSentSuccess ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  ✓
                </div>
                <p className="text-sm font-bold text-white">Message Sent Successfully!</p>
                <p className="text-xs text-neutral-400 mt-1">Our team will review your inquiry and reply via email.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Your Question or Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Have questions about subscription upgrades, custom features, or account settings? Write here..."
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingSupport || !supportMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition disabled:opacity-50"
                  >
                    {sendingSupport ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}