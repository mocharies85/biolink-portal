'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import StoryModal from '@/components/StoryModal';

import { UserProfile, LinkItem, StoryItem, THEMES } from './types';
import BioHeader from './components/BioHeader';
import BioShowcaseVideo from './components/BioShowcaseVideo';
import BioMediaKitBanner from './components/BioMediaKitBanner';
import BioLinksList from './components/BioLinksList';
import BioMessaging from './components/BioMessaging';
import BioAudioPlayer from './components/BioAudioPlayer';
import BioModals from './components/BioModals';

export default function UserBioClient() {
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        return pathPart.toLowerCase();
      }
    }
    return '';
  });

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    tagline: 'Digital Creator',
    bio: '',
    avatar: '/default-avatar.svg',
    socials: {},
    is_pro: 0,
    theme: 'dark',
    bg_image: '',
    bg_music_url: '',
    bg_music_title: '',
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Media Kit Status State
  const [isMediaKitActive, setIsMediaKitActive] = useState(false);

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Audio Sync Refs & States
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicMutedByVideo, setMusicMutedByVideo] = useState(false);
  const [musicMutedByStory, setMusicMutedByStory] = useState(false);

  // PIN Unlock State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [targetPinLink, setTargetPinLink] = useState<LinkItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const handleLinkClick = (id: number) => {
    fetch(`/api/click?id=${id}`, { method: 'POST' }).catch(() => {});
  };

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinLink || !pinInput.trim()) return;

    setIsVerifyingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_pin',
          linkId: targetPinLink.id,
          pin: pinInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error || 'Invalid PIN code.');
        setIsVerifyingPin(false);
        return;
      }

      handleLinkClick(targetPinLink.id);
      window.open(data.url, '_blank', 'noopener,noreferrer');
      setPinModalOpen(false);
      setPinInput('');
      setTargetPinLink(null);
    } catch {
      setPinError('Failed to verify PIN. Please check your connection.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        setUsername(pathPart.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    let isCurrent = true;
    setLoadingLinks(true);

    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error('Failed to load profile:', err));

    fetch(`/api/links?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setLinks(data.links || []);
        setIsProUser(Boolean(data.isPro));
      })
      .catch((err) => console.error('Failed to load links:', err))
      .finally(() => {
        if (isCurrent) setLoadingLinks(false);
      });

    fetch(`/api/stories?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setStories(Array.isArray(data.stories) ? data.stories : []);
      })
      .catch((err) => console.error('Failed to load stories:', err));

    // Fetch Media Kit Status
    fetch(`/api/mediakit?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        const kit = data?.mediakit || data?.mediaKit;
        if (kit) {
          const pkgs = kit.rate_cards || kit.packages || [];
          const hasPackages = pkgs.length > 0;
          setIsMediaKitActive(Boolean(kit.is_enabled && hasPackages));
        } else {
          setIsMediaKitActive(false);
        }
      })
      .catch(() => {
        if (isCurrent) setIsMediaKitActive(false);
      });

    const sessionKey = `curiolot_viewed_${username}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      fetch(`/api/views?username=${encodeURIComponent(username)}`, { method: 'POST' })
        .then(() => sessionStorage.setItem(sessionKey, '1'))
        .catch((err) => console.error('Failed to log view:', err));
    }

    return () => {
      isCurrent = false;
    };
  }, [username]);

  // Audio Sync with Video
  useEffect(() => {
    const video = videoRef.current;
    const bgAudio = bgMusicRef.current;
    if (!video || !bgAudio) return;

    const handleAudioSync = () => {
      const isVideoSoundActive = !video.paused && !video.muted && video.volume > 0;
      if (isVideoSoundActive) {
        if (!bgAudio.paused) {
          bgAudio.pause();
          setMusicMutedByVideo(true);
        }
      } else {
        if (musicMutedByVideo && isPlayingMusic && !musicMutedByStory && !isStoryOpen) {
          bgAudio.play().catch(() => {});
          setMusicMutedByVideo(false);
        }
      }
    };

    video.addEventListener('play', handleAudioSync);
    video.addEventListener('pause', handleAudioSync);
    video.addEventListener('volumechange', handleAudioSync);
    video.addEventListener('ended', handleAudioSync);

    return () => {
      video.removeEventListener('play', handleAudioSync);
      video.removeEventListener('pause', handleAudioSync);
      video.removeEventListener('volumechange', handleAudioSync);
      video.removeEventListener('ended', handleAudioSync);
    };
  }, [isPlayingMusic, musicMutedByVideo, musicMutedByStory, isStoryOpen]);

  // Audio Sync with Stories
  useEffect(() => {
    const bgAudio = bgMusicRef.current;
    if (!bgAudio) return;

    if (isStoryOpen) {
      if (!bgAudio.paused) {
        bgAudio.pause();
        setMusicMutedByStory(true);
      }
    } else {
      if (musicMutedByStory && isPlayingMusic && !musicMutedByVideo) {
        bgAudio.play().catch(() => {});
        setMusicMutedByStory(false);
      }
    }
  }, [isStoryOpen, isPlayingMusic, musicMutedByVideo, musicMutedByStory]);

  // Global Audio Listener
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      const playingElement = e.target as HTMLMediaElement;
      if (bgMusicRef.current && playingElement !== bgMusicRef.current) {
        if (!bgMusicRef.current.paused) {
          bgMusicRef.current.pause();
        }
      }
    };

    window.addEventListener('play', handleGlobalPlay, true);
    return () => {
      window.removeEventListener('play', handleGlobalPlay, true);
    };
  }, []);

  const toggleBackgroundMusic = () => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    if (isPlayingMusic) {
      audio.pause();
      setIsPlayingMusic(false);
      setMusicMutedByVideo(false);
      setMusicMutedByStory(false);
    } else {
      audio.play().then(() => {
        setIsPlayingMusic(true);
        setMusicMutedByVideo(false);
        setMusicMutedByStory(false);
      }).catch((err) => {
        console.warn('Audio play restricted by browser autoplay policy:', err);
      });
    }
  };

  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio || !profile?.bg_music_url) return;

    const handleFirstTouch = () => {
      if (audio.paused && !isStoryOpen) {
        audio.play().then(() => {
          setIsPlayingMusic(true);
          setMusicMutedByVideo(false);
          setMusicMutedByStory(false);
        }).catch(() => {});
      }
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
    };

    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('scroll', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
    };
  }, [profile?.bg_music_url, isStoryOpen]);

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://link.curiolot.com/${username}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }

    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: profile.name || username,
          text: profile.bio,
          url: currentUrl,
        });
      } catch {}
    }
  };

  const currentFullUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://link.curiolot.com/${username}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(currentFullUrl)}`;

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${username}-biolink-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  const isPro = isProUser || profile.is_pro === 1;
  const currentThemeKey = profile.theme && THEMES[profile.theme] ? profile.theme : 'dark';
  const theme = THEMES[currentThemeKey];
  const hasActiveWallpaper = Boolean(isPro && profile.bg_image);
  const hasBgMusic = Boolean(isPro && profile.bg_music_url);
  const isMusicAudible = isPlayingMusic && !musicMutedByVideo && !musicMutedByStory;

  return (
    <main 
      className={`min-h-screen flex justify-center py-10 px-4 sm:px-6 relative overflow-hidden font-sans transition-colors duration-300 ${theme.pageBg}`}
      style={
        hasActiveWallpaper
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${profile.bg_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* Background Audio Element */}
      {hasBgMusic && (
        <audio
          ref={bgMusicRef}
          src={profile.bg_music_url}
          loop
          preload="auto"
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      {!hasActiveWallpaper && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <BioHeader
          username={username}
          profile={profile}
          isPro={isPro}
          theme={theme}
          stories={stories}
          isCopied={isCopied}
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenQr={() => setShowQrModal(true)}
          onShare={handleShare}
        />

        <BioShowcaseVideo
          profile={profile}
          isPro={isPro}
          theme={theme}
          videoRef={videoRef}
        />

        <BioMediaKitBanner
          username={username}
          isPro={isPro}
          isEnabled={isMediaKitActive}
        />

        <BioLinksList
          links={links}
          loadingLinks={loadingLinks}
          isPro={isPro}
          theme={theme}
          onLinkClick={handleLinkClick}
          onRequirePin={(link: LinkItem) => {
            setTargetPinLink(link);
            setPinInput('');
            setPinError('');
            setPinModalOpen(true);
          }}
        />

        <BioMessaging
          username={username}
          theme={theme}
        />

        <footer className="flex flex-col items-center gap-1 text-center text-xs text-neutral-500">
          <p className="flex items-center gap-1 text-[11px]">
            Powered by <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> Curiolot Link
          </p>
        </footer>
      </div>

      <BioAudioPlayer
        hasBgMusic={hasBgMusic}
        isPlayingMusic={isPlayingMusic}
        isMusicAudible={isMusicAudible}
        musicMutedByStory={musicMutedByStory}
        musicMutedByVideo={musicMutedByVideo}
        trackTitle={profile.bg_music_title}
        onToggle={toggleBackgroundMusic}
      />

      <StoryModal
        stories={stories}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        username={username}
        isPro={isPro}
      />

      <BioModals
        username={username}
        showQrModal={showQrModal}
        onCloseQr={() => setShowQrModal(false)}
        qrImageUrl={qrImageUrl}
        onDownloadQr={handleDownloadQr}
        pinModalOpen={pinModalOpen}
        targetPinLink={targetPinLink}
        pinInput={pinInput}
        pinError={pinError}
        isVerifyingPin={isVerifyingPin}
        onPinChange={setPinInput}
        onUnlockPin={handleUnlockPin}
        onClosePin={() => {
          setPinModalOpen(false);
          setPinInput('');
          setPinError('');
          setTargetPinLink(null);
        }}
      />
    </main>
  );
}