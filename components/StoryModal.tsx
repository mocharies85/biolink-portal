'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';

interface Story {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number | string;
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

export default function StoryModal({ stories, isOpen, onClose, username, isPro }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = stories[currentIndex];
  const isVideo = isVideoUrl(current?.media_url);

  // Hitung durasi tayang foto secara dinamis (25s / 45s / 60s / 10s)
  const parsedDuration = Number(current?.duration);
  const effectivePhotoDuration = !isNaN(parsedDuration) && parsedDuration > 0
    ? parsedDuration
    : (isPro ? 25 : 10);

  // Reset state tiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
      setVideoDuration(0);
    }
  }, [isOpen]);

  // Reset progress & durasi video saat berpindah slide
  useEffect(() => {
    setProgress(0);
    setVideoDuration(0);
  }, [currentIndex]);

  // Kelola audio soundtrack dan pemutaran video (Dioptimalkan untuk Mobile & iOS)
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
        audioRef.current.load(); // Wajib di mobile agar audio buffer siap putar
        audioRef.current.play().catch(() => {});
      }
    }

    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = Boolean(current.audio_url) || isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, currentIndex, current?.audio_url, current?.media_url, isVideo]);

  // Sinkronisasi status audio Mute / Unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = Boolean(current?.audio_url) || isMuted;
    }
  }, [isMuted, current?.audio_url]);

  // Navigasi ke slide selanjutnya
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  // Navigasi ke slide sebelumnya
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
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

  // Baca metadata durasi video otomatis (maksimal cap 60 detik)
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    const naturalDur = vid.duration || 10;
    const effectiveDur = Math.min(naturalDur, 60);
    setVideoDuration(effectiveDur);
  };

  // Timer progres dinamis: Mengikuti durasi video asli ATAU durasi foto terpilih
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
      const durationMs = effectivePhotoDuration * 1000;
      const intervalTime = 50;
      const step = 100 / (durationMs / intervalTime);

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            handleNext();
            return 100;
          }
          return prev + step;
        });
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [isOpen, currentIndex, isVideo, videoDuration, effectivePhotoDuration, stories.length]);

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

        {/* Header: Username, Badge Durasi Dinamis, Tombol Link & Kontrol */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between text-white gap-1.5">
          {/* Sisi Kiri: Username & Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-xs text-neutral-200">@{username}</span>

            {/* Badge Durasi Dinamis (Menampilkan Durasi Asli) */}
            {isVideo ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-1 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Video {videoDuration > 0 ? `${Math.round(videoDuration)}s` : '60s'}</span>
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${
                effectivePhotoDuration > 10 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
              }`}>
                {effectivePhotoDuration > 10 ? `PRO ${effectivePhotoDuration}s` : '10s'}
              </span>
            )}

            {current.audio_url && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                ♫
              </span>
            )}
          </div>

          {/* Sisi Tengah: Stiker Link Tautan */}
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

          {/* Sisi Kanan: Audio & Tutup */}
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

        {/* Media Container */}
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
              src={current.media_url} 
              alt="Story content" 
              className="w-full h-full object-contain" 
            />
          )}
          
          {/* Area Sentuh Kiri / Kanan Navigasi */}
          <button 
            type="button" 
            onClick={handlePrev} 
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10" 
            aria-label="Previous story"
          />
          <button 
            type="button" 
            onClick={handleNext} 
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10" 
            aria-label="Next story"
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