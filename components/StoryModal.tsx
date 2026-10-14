'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Story {
  id: string;
  media_url: string;
  caption?: string;
}

interface StoryModalProps {
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function StoryModal({ stories, isOpen, onClose, username }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Reset indeks saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [isOpen]);

  // Timer transisi otomatis 5 detik per slide
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    const interval = 50; // update progress tiap 50ms
    const step = 100 / (5000 / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const current = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-[580px] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col justify-between">
        
        {/* Progress Bar Atas */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
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

        {/* Header: Username & Tombol Tutup */}
        <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between text-white">
          <span className="font-semibold text-xs text-neutral-200">@{username}</span>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full bg-black/40 hover:bg-black/60 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Area Gambar Media Story */}
        <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
          <img 
            src={current.media_url} 
            alt="Story content" 
            className="w-full h-full object-cover"
          />
          
          {/* Area Sentuh Kiri (Kembali) & Kanan (Lanjut) */}
          <button onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
          <button onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
        </div>

        {/* Teks Keterangan (Caption) */}
        {current.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 bg-neutral-950/80 backdrop-blur-md rounded-2xl border border-neutral-800 text-xs text-center text-white">
            {current.caption}
          </div>
        )}
      </div>
    </div>
  );
}