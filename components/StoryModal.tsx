'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';

interface Story {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  duration?: number; // 10 atau 60 detik
}

interface StoryModalProps {
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isPro?: boolean;
}

export default function StoryModal({ stories, isOpen, onClose, username, isPro }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = stories[currentIndex];
  // Durasi dinamis per slide (default 10 detik untuk free, 60 detik untuk PRO)
  const currentDurationMs = ((current?.duration || (isPro ? 60 : 10)) * 1000);

  // Reset indeks saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [isOpen]);

  // Kelola pemutaran audio tiap ganti slide
  useEffect(() => {
    if (!isOpen || !current) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      if (current.audio_url) {
        audioRef.current.src = current.audio_url;
        audioRef.current.muted = isMuted;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isOpen, currentIndex, current?.audio_url]);

  // Mute / Unmute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Timer transisi progresif sesuai durasi story (10 detik atau 60 detik)
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    const interval = 50; // update setiap 50ms
    const step = 100 / (currentDurationMs / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            handleClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, currentDurationMs]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  if (!isOpen || stories.length === 0 || !current) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const isCurrentStoryPro = current.duration === 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <audio ref={audioRef} loop />

      <div className="relative w-full max-w-sm h-[600px] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col justify-between">
        
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

        {/* Header: Username, PRO Badge & Controls */}
        <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-neutral-200">@{username}</span>
            {isCurrentStoryPro ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-1 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" /> PRO 60s
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 text-[9px] font-medium border border-neutral-700">
                10s
              </span>
            )}
            {current.audio_url && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                ♫
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {current.audio_url && (
              <button 
                type="button"
                onClick={() => setIsMuted(!isMuted)} 
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}

            <button 
              type="button"
              onClick={handleClose} 
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Media Story */}
        <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
          <img 
            src={current.media_url} 
            alt="Story content" 
            className="w-full h-full object-cover"
          />

          {/* Stiker Link Tautan */}
          {current.link_url && (
            <div className="absolute bottom-20 z-30 flex justify-center w-full px-6">
              <a
                href={current.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2.5 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-neutral-200 group"
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-45 transition-transform" />
                <span className="max-w-[180px] truncate">
                  {current.link_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </span>
                <ExternalLink className="w-3 h-3 text-neutral-500" />
              </a>
            </div>
          )}
          
          {/* Navigasi Layar Sentuh Kiri / Kanan */}
          <button onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
          <button onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
        </div>

        {/* Caption */}
        {current.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 bg-neutral-950/85 backdrop-blur-md rounded-2xl border border-neutral-800 text-xs text-center text-white">
            {current.caption}
          </div>
        )}
      </div>
    </div>
  );
}