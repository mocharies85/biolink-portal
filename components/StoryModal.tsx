'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';

interface Story {
  id: string;
  media_url: string;
  media_urls?: string | null;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number | string;
  total_duration?: number;
  animation_style?: 'slide' | 'fade' | 'zoom';
}

interface StoryModalProps {
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isPro?: boolean;
}

// Helper: Deteksi apakah format media adalah video
const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('data:video') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

// Helper: Ekstraksi daftar gambar (dukungan single & multi-gambar)
const getStoryImages = (story?: Story): string[] => {
  if (!story) return [];
  if (story.media_urls) {
    try {
      const parsed = JSON.parse(story.media_urls);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return story.media_url ? [story.media_url] : [];
};

export default function StoryModal({ stories, isOpen, onClose, username, isPro }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = stories[currentIndex];
  const currentImages = getStoryImages(current);
  const isMultiImage = currentImages.length > 1;
  const isVideo = !isMultiImage && isVideoUrl(current?.media_url);

  // Hitung total durasi tayang story (25s / 45s / 60s / 10s)
  const effectiveTotalDuration = Number(current?.total_duration) || 
    Number(current?.duration) || 
    (isPro ? 25 : 10);

  const durationPerSlide = effectiveTotalDuration / Math.max(1, currentImages.length);
  const animationStyle = current?.animation_style || 'slide';

  // Reset saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setCurrentSubIndex(0);
      setProgress(0);
      setVideoDuration(0);
    }
  }, [isOpen]);

  // Reset sub-slide & durasi video saat berpindah story utama
  useEffect(() => {
    setCurrentSubIndex(0);
    setProgress(0);
    setVideoDuration(0);
  }, [currentIndex]);

  // Kelola pemutaran audio soundtrack (Lagu terus berjalan mulus antar multi-gambar)
  useEffect(() => {
    if (!isOpen || !current) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      if (current.audio_url) {
        if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
          try {
            (navigator as any).audioSession.type = 'playback';
          } catch {}
        }

        audioRef.current.src = current.audio_url;
        audioRef.current.muted = isMuted;
        audioRef.current.volume = 1.0;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }

    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = Boolean(current.audio_url) || isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, currentIndex, current?.audio_url, isVideo]);

  // Sinkronisasi status audio Mute / Unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = Boolean(current?.audio_url) || isMuted;
    }
  }, [isMuted, current?.audio_url]);

  // Navigasi maju: Pindah antar slide gambar dulu, baru ke story berikutnya
  const handleNext = () => {
    if (isMultiImage && currentSubIndex < currentImages.length - 1) {
      setCurrentSubIndex((prev) => prev + 1);
    } else if (currentIndex < stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setCurrentSubIndex(0);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  // Navigasi mundur: Mundur slide gambar dulu, baru ke story sebelumnya
  const handlePrev = () => {
    if (isMultiImage && currentSubIndex > 0) {
      setCurrentSubIndex((prev) => prev - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setCurrentSubIndex(0);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  // Metadata durasi video
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    const naturalDur = vid.duration || 10;
    setVideoDuration(Math.min(naturalDur, 60));
  };

  // Timer progres bar & pergantian slide otomatis
  useEffect(() => {
    if (!isOpen || !current) return;

    if (isVideo) {
      const interval = setInterval(() => {
        if (videoRef.current && videoDuration > 0) {
          const curTime = videoRef.current.currentTime;
          if (curTime >= videoDuration) {
            clearInterval(interval);
            handleNext();
          } else {
            setProgress((curTime / videoDuration) * 100);
          }
        }
      }, 40);

      return () => clearInterval(interval);
    } else {
      const intervalMs = 50;
      let elapsedMs = currentSubIndex * durationPerSlide * 1000;
      const totalMs = effectiveTotalDuration * 1000;

      const timer = setInterval(() => {
        elapsedMs += intervalMs;
        const currentProgress = Math.min((elapsedMs / totalMs) * 100, 100);
        setProgress(currentProgress);

        // Update indeks gambar aktif sesuai waktu berjalan
        const expectedSubIndex = Math.min(
          Math.floor((elapsedMs / totalMs) * currentImages.length),
          currentImages.length - 1
        );
        if (expectedSubIndex !== currentSubIndex) {
          setCurrentSubIndex(expectedSubIndex);
        }

        if (elapsedMs >= totalMs) {
          clearInterval(timer);
          handleNext();
        }
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, [isOpen, currentIndex, currentSubIndex, isVideo, videoDuration, effectiveTotalDuration, currentImages.length, durationPerSlide]);

  if (!isOpen || stories.length === 0 || !current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <audio ref={audioRef} preload="auto" playsInline loop />

      <div className="relative w-full max-w-sm h-[600px] bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col justify-between">
        
        {/* Progress Bar Atas */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-75"
                style={{ 
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' 
                }} 
              />
            </div>
          ))}
        </div>

        {/* Header: Username, Badge Durasi, Tombol Link & Kontrol */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between text-white gap-1.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-xs text-neutral-200">@{username}</span>

            {/* Badge Durasi & Indikator Carousel */}
            {isVideo ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-1 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Video {videoDuration > 0 ? `${Math.round(videoDuration)}s` : '60s'}</span>
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold flex items-center gap-1 ${
                effectiveTotalDuration > 10 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
              }`}>
                {isMultiImage && (
                  <span>{currentSubIndex + 1}/{currentImages.length} •</span>
                )}
                <span>{effectiveTotalDuration > 10 ? `PRO ${effectiveTotalDuration}s` : '10s'}</span>
              </span>
            )}

            {current.audio_url && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                ♫
              </span>
            )}
          </div>

          {/* Stiker Link Tautan */}
          {current.link_url && (
            <a
              href={current.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full bg-white text-neutral-950 font-bold text-[10px] flex items-center gap-1 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 border border-neutral-200 group truncate shrink min-w-0 max-w-[130px] sm:max-w-[150px]"
              title={current.link_url}
            >
              <LinkIcon className="w-3 h-3 text-emerald-600 group-hover:rotate-45 transition-transform shrink-0" />
              <span className="truncate">
                {current.link_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
            </a>
          )}

          {/* Kontrol Audio & Tutup */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(current.audio_url || isVideo) && (
              <button 
                type="button" 
                onClick={() => setIsMuted(!isMuted)} 
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            )}

            <button 
              type="button" 
              onClick={handleClose} 
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Kontainer Media dengan Animasi Slide */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {isVideo ? (
            <video 
              ref={videoRef}
              src={current.media_url} 
              autoPlay 
              playsInline 
              onLoadedMetadata={handleVideoLoadedMetadata}
              onEnded={handleNext}
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              key={`${current.id}-${currentSubIndex}`}
              src={currentImages[currentSubIndex]} 
              alt={`Slide ${currentSubIndex + 1}`} 
              className={`w-full h-full object-contain ${
                animationStyle === 'fade'
                  ? 'animate-fade-in'
                  : animationStyle === 'zoom'
                  ? 'animate-zoom-in'
                  : 'animate-slide-left'
              }`} 
            />
          )}

          {/* Indikator Titik Carousel (Khusus Multi-Gambar) */}
          {isMultiImage && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
              {currentImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSubIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Navigasi Sentuh Kiri / Kanan */}
          <button 
            type="button" 
            onClick={handlePrev} 
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10" 
            aria-label="Previous slide"
          />
          <button 
            type="button" 
            onClick={handleNext} 
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10" 
            aria-label="Next slide"
          />
        </div>

        {/* Caption Bawah */}
        {current.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 bg-neutral-950/85 backdrop-blur-md rounded-2xl border border-neutral-800 text-xs text-center text-white leading-relaxed">
            {current.caption}
          </div>
        )}
      </div>
    </div>
  );
}