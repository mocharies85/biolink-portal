'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Link2,
  MessageSquare,
  BarChart3,
  ExternalLink,
  HelpCircle,
  LogOut,
  Radio,
  QrCode,
  Palette,
  Briefcase,
} from 'lucide-react';

import {
  ProfileData,
  CurrentUser,
  LinkItem,
  StoryItem,
  MusicTrack,
  DetailedAnalyticsData,
  MediaKitData,
  THEME_STYLES,
} from './types';

import TabProfile from './components/TabProfile';
import TabLinks from './components/TabLinks';
const TabThemes = dynamic(
  () => import('./components/TabThemes').then((mod) => mod.default || mod.TabThemes || mod),
  { ssr: false }
);
import TabStories from './components/TabStories';
import TabInbox from './components/TabInbox';
import TabAnalytics from './components/TabAnalytics';
import TabMediaKit from './components/TabMediaKit';
import PhoneMockup from './components/PhoneMockup';
import AdminModals from './components/AdminModals';

export default function AdminDashboard() {
  const router = useRouter();
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'profile' | 'links' | 'themes' | 'stories' | 'inbox' | 'analytics' | 'mediakit'
  >('profile');

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Profile State
  const [profile, setProfile] = useState<ProfileData>({
    name: 'New Creator',
    tagline: 'Digital Creator',
    bio: '',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFn1j2rBLlFiBcfGcVJIaDSgFJtkTTyax4OwTrI_sH5Q&s=10',
    views: 0,
    socials: {},
    og_title: '',
    og_description: '',
    og_image: '',
    theme: 'dark',
    bg_image: '',
    featured_video_url: '',
    show_featured_video: 0,
    featured_video_autoplay: 1,
    featured_video_title: '',
    bg_music_url: '',
    bg_music_title: '',
    is_pro: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Links State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Stories State
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  // Music Tracks State
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  // Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Detailed Analytics State
  const [detailedData, setDetailedData] = useState<DetailedAnalyticsData | null>(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);

  // Media Kit State (Default: 0 / Kosong & OFF untuk user baru)
  const [mediaKit, setMediaKit] = useState<MediaKitData>({
    is_enabled: false,
    headline: 'Content Creator & Brand Partner',
    about: 'I create engaging short-form content, digital product reviews, and creative portfolio showcases for modern brands.',
    contact_email: '',
    total_followers: 0,
    monthly_impressions: 0,
    engagement_rate: 0,
    primary_niche: 'Tech & Lifestyle',
    audience_country: 'United States',
    rate_cards: [],
  });

  // Ref untuk melacak perubahan jumlah paket secara real-time
  const prevPackagesCountRef = useRef<number>(0);

  // Modals Visibility
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Support Form State
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  // Checkout State
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const activeUsername = currentUser?.username || 'creator';
  const isProUser = currentUser?.is_pro === 1 || Boolean(profile?.is_pro);

  const viewsCount = profile.views || 0;
  const clicksCount = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  const currentThemeKey = profile.theme && THEME_STYLES[profile.theme] ? profile.theme : 'dark';
  const activeTheme = THEME_STYLES[currentThemeKey];

  const liveProfileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${activeUsername}`
      : `https://link.curiolot.com/${activeUsername}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(
    liveProfileUrl
  )}`;

  // Logika Otomatis ON/OFF Media Kit Berdasarkan Jumlah Paket
  useEffect(() => {
    const currentCount = mediaKit.rate_cards?.length || 0;
    const prevCount = prevPackagesCountRef.current;

    // Jika paket 0 -> Otomatis paksa OFF
    if (currentCount === 0 && mediaKit.is_enabled) {
      setMediaKit((prev) => ({ ...prev, is_enabled: false }));
    }
    // Jika awalnya 0 paket lalu bertambah ada paket -> Default otomatis ON
    else if (prevCount === 0 && currentCount > 0 && !mediaKit.is_enabled) {
      setMediaKit((prev) => ({ ...prev, is_enabled: true }));
    }

    prevPackagesCountRef.current = currentCount;
  }, [mediaKit.rate_cards?.length, mediaKit.is_enabled]);

  // Session Validation
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

  // Audio Playback Lifecycle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onended = () => setPreviewingTrackId(null);
      audio.onerror = () => setPreviewingTrackId(null);
      previewAudioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  // Fetching Functions
  const fetchProfile = async () => {
    if (!activeUsername) return;
    try {
      const res = await fetch(`/api/profile?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          let parsedSocials = {};
          if (typeof data.profile.socials === 'string') {
            try {
              parsedSocials = JSON.parse(data.profile.socials);
            } catch {}
          } else if (typeof data.profile.socials === 'object' && data.profile.socials !== null) {
            parsedSocials = data.profile.socials;
          }

          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            socials: parsedSocials,
          }));
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
      const res = await fetch(`/api/links?username=${activeUsername}&admin=true`);
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

  const fetchMediaKit = async () => {
    if (!activeUsername) return;
    try {
      const res = await fetch(`/api/mediakit?username=${encodeURIComponent(activeUsername)}`);
      if (res.ok) {
        const data = await res.json();
        const kit = data.mediakit || data.mediaKit;
        if (kit) {
          const pkgs = kit.rate_cards || kit.packages || [];
          setMediaKit({
            ...kit,
            rate_cards: pkgs,
            is_enabled: pkgs.length > 0 ? Boolean(kit.is_enabled) : false,
          });
          prevPackagesCountRef.current = pkgs.length;
        }
      }
    } catch (err) {
      console.warn('Failed to load media kit:', err);
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
      fetchMediaKit();
    }
  }, [currentUser]);

  // Actions
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
          socials: profile.socials || {},
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

  const handlePaddleCheckout = () => {
    setCheckoutLoading(true);
    const openPaddle = () => {
      try {
        const paddle = (window as any).Paddle;
        if (paddle) {
          paddle.Environment.set('production');
          paddle.Initialize({ token: 'live_b22de345130295633b70feef146' });
          setShowUpgradeModal(false);
          paddle.Checkout.open({
            items: [{ priceId: 'pri_01m5w9cxb38v3xa2rhpd3e54an', quantity: 1 }],
            customer: currentUser?.email ? { email: currentUser.email } : undefined,
            customData: {
              username: activeUsername,
              userId: String(currentUser?.id || ''),
            },
          });
        }
      } catch {
        alert('Failed to launch Paddle checkout. Please disable ad-blockers and try again.');
      } finally {
        setCheckoutLoading(false);
      }
    };

    if (typeof window !== 'undefined' && (window as any).Paddle) {
      openPaddle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => openPaddle();
      script.onerror = () => {
        setCheckoutLoading(false);
        alert('Failed to load Paddle script. Please check your connection.');
      };
      document.head.appendChild(script);
    }
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

  const handleLogout = () => {
    sessionStorage.removeItem('curiolot_auth_user');
    router.push('/login');
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

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
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

            <button
              onClick={() => setActiveTab('mediakit')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'mediakit'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Media Kit</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                PRO
              </span>
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

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === 'profile' && (
          <TabProfile
            profile={profile}
            setProfile={setProfile}
            activeUsername={activeUsername}
            isProUser={isProUser}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setShowUpgradeModal={setShowUpgradeModal}
            savingProfile={savingProfile}
            profileSavedSuccess={profileSavedSuccess}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {activeTab === 'links' && (
          <TabLinks
            links={links}
            setLinks={setLinks}
            loadingLinks={loadingLinks}
            activeUsername={activeUsername}
            isProUser={isProUser}
            profile={profile}
            setProfile={setProfile}
            setShowUpgradeModal={setShowUpgradeModal}
            fetchLinks={fetchLinks}
            handleSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
          />
        )}

        {activeTab === 'themes' && (
          <TabThemes
            profile={profile}
            setProfile={setProfile}
            isProUser={isProUser}
            setShowUpgradeModal={setShowUpgradeModal}
            handleSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            profileSavedSuccess={profileSavedSuccess}
            musicTracks={musicTracks}
            activeUsername={activeUsername}
          />
        )}

        {activeTab === 'stories' && (
          <TabStories
            stories={stories}
            setStories={setStories}
            loadingStories={loadingStories}
            activeUsername={activeUsername}
            isProUser={isProUser}
            setShowUpgradeModal={setShowUpgradeModal}
            fetchStories={fetchStories}
            musicTracks={musicTracks}
            loadingMusic={loadingMusic}
            previewAudioRef={previewAudioRef}
            previewingTrackId={previewingTrackId}
            setPreviewingTrackId={setPreviewingTrackId}
          />
        )}

        {activeTab === 'inbox' && (
          <TabInbox
            messages={messages}
            loadingMessages={loadingMessages}
            activeUsername={activeUsername}
            isProUser={isProUser}
          />
        )}

        {activeTab === 'analytics' && (
          <TabAnalytics
            viewsCount={viewsCount}
            clicksCount={clicksCount}
            isProUser={isProUser}
            activeUsername={activeUsername}
            setShowUpgradeModal={setShowUpgradeModal}
            setShowDetailedInsights={setShowDetailedInsights}
            fetchDetailedAnalytics={fetchDetailedAnalytics}
          />
        )}

        {activeTab === 'mediakit' && (
          <TabMediaKit
            activeUsername={activeUsername}
            mediaKit={mediaKit}
            setMediaKit={setMediaKit}
            isPro={isProUser}
          />
        )}
      </main>

      {/* Right Side Smartphone Preview */}
      <PhoneMockup
        profile={profile}
        links={links}
        stories={stories}
        activeUsername={activeUsername}
        isProUser={isProUser}
        activeTheme={activeTheme}
        mediaKit={mediaKit}
      />

      {/* Pop-up Modals Container */}
      <AdminModals
        showQrModal={showQrModal}
        setShowQrModal={setShowQrModal}
        qrImageUrl={qrImageUrl}
        activeUsername={activeUsername}
        showUpgradeModal={showUpgradeModal}
        setShowUpgradeModal={setShowUpgradeModal}
        checkoutLoading={checkoutLoading}
        handlePaddleCheckout={handlePaddleCheckout}
        showDetailedInsights={showDetailedInsights}
        setShowDetailedInsights={setShowDetailedInsights}
        detailedData={detailedData}
        loadingDetailed={loadingDetailed}
        links={links}
        viewsCount={viewsCount}
        clicksCount={clicksCount}
        showSupportModal={showSupportModal}
        setShowSupportModal={setShowSupportModal}
        supportMessage={supportMessage}
        setSupportMessage={setSupportMessage}
        sendingSupport={sendingSupport}
        supportSentSuccess={supportSentSuccess}
        handleSendSupport={handleSendSupport}
      />
    </div>
  );
}