import React from 'react';
import { Disc3, Volume2, VolumeX } from 'lucide-react';

interface BioAudioPlayerProps {
  hasBgMusic: boolean;
  isPlayingMusic: boolean;
  isMusicAudible: boolean;
  musicMutedByStory: boolean;
  musicMutedByVideo: boolean;
  trackTitle?: string;
  onToggle: () => void;
}

export default function BioAudioPlayer({
  hasBgMusic,
  isPlayingMusic,
  isMusicAudible,
  musicMutedByStory,
  musicMutedByVideo,
  trackTitle,
  onToggle,
}: BioAudioPlayerProps) {
  if (!hasBgMusic) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-full border backdrop-blur-xl shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 ${
        isMusicAudible
          ? 'bg-neutral-900/90 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
          : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300'
      }`}
      title={isPlayingMusic ? 'Mute background music' : 'Play background music'}
    >
      <Disc3
        className={`w-4 h-4 text-emerald-400 shrink-0 ${
          isMusicAudible ? 'animate-spin' : ''
        }`}
      />
      <div className="flex flex-col text-left max-w-[130px] truncate">
        <span className="text-[10px] font-bold truncate leading-tight text-white">
          {trackTitle || 'Background Track'}
        </span>
        <span className="text-[8px] text-neutral-400 leading-tight">
          {musicMutedByStory
            ? 'Muted for Story'
            : musicMutedByVideo
            ? 'Muted for Video'
            : isPlayingMusic
            ? 'Playing Ambient'
            : 'Tap to Play'}
        </span>
      </div>
      <div className="p-1 rounded-full bg-neutral-800 text-neutral-300">
        {isMusicAudible ? (
          <Volume2 className="w-3 h-3 text-emerald-400" />
        ) : (
          <VolumeX className="w-3 h-3 text-neutral-400" />
        )}
      </div>
    </button>
  );
}