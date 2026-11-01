'use client';

import React, { useRef, useState } from 'react';
import {
  Radio,
  ImageIcon,
  Video as VideoIcon,
  Lock,
  Clock,
  Sparkles,
  Upload,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Music,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { StoryItem, MusicTrack } from '../types';
import {
  getStoryTierDuration,
  compressImage,
  trimAndCompressAudio,
} from '../utils/mediaUtils';

interface TabStoriesProps {
  stories: StoryItem[];
  setStories: React.Dispatch<React.SetStateAction<StoryItem[]>>;
  loadingStories: boolean;
  activeUsername: string;
  isProUser: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  fetchStories: () => Promise<void>;
  musicTracks: MusicTrack[];
  loadingMusic: boolean;
  previewAudioRef: React.RefObject<HTMLAudioElement | null>;
  previewingTrackId: string | null;
  setPreviewingTrackId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function TabStories({
  stories,
  setStories,
  loadingStories,
  activeUsername,
  isProUser,
  setShowUpgradeModal,
  fetchStories,
  musicTracks,
  loadingMusic,
  previewAudioRef,
  previewingTrackId,
  setPreviewingTrackId,
}: TabStoriesProps) {
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const customAudioInputRef = useRef<HTMLInputElement>(null);

  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [selectedPhotoDuration, setSelectedPhotoDuration] = useState<number>(25);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [directMediaUrl, setDirectMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyAudioUrl, setStoryAudioUrl] = useState('');
  const [storyLinkUrl, setStoryLinkUrl] = useState('');
  const [postingStory, setPostingStory] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const [compressingStory, setCompressingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  // Multi-Image Carousel States
  const [storyMediaUrls, setStoryMediaUrls] = useState<string[]>([]);
  const [storyAnimationStyle, setStoryAnimationStyle] = useState<'slide' | 'fade' | 'zoom'>('slide');
  const [storyTotalDuration, setStoryTotalDuration] = useState<number>(25);
  const [processingMultiImages, setProcessingMultiImages] = useState(false);

  // Audio Selection States
  const [selectedTrackTitle, setSelectedTrackTitle] = useState<string>('');
  const [processingAudio, setProcessingAudio] = useState(false);

  const plannedDuration = storyMediaType === 'video' ? 60 : isProUser ? selectedPhotoDuration : 10;

  // Toggle Audio Preview
  const handleTogglePreview = async (track: MusicTrack, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!previewAudioRef.current) return;
    const audio = previewAudioRef.current;

    if (previewingTrackId === track.id) {
      audio.pause();
      setPreviewingTrackId(null);
      return;
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = track.url;
      setPreviewingTrackId(track.id);
      await audio.play();
    } catch {
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

    setProcessingAudio(true);
    try {
      const trimmedBase64 = await trimAndCompressAudio(file, plannedDuration);
      setStoryAudioUrl(trimmedBase64);
      setSelectedTrackTitle(`${file.name.replace(/\.[^/.]+$/, '')} (${plannedDuration}s auto-trimmed)`);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    } catch {
      alert('Failed to process audio file. Please choose a standard MP3 or WAV.');
    } finally {
      setProcessingAudio(false);
      e.target.value = '';
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

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setStoryMediaUrl(data.url);
          setDirectMediaUrl('');
        } else {
          alert('Failed to upload video to Cloudflare R2.');
        }
      } catch {
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
        setDirectMediaUrl('');
      } catch {
        alert('Failed to process story image. Please use JPG or PNG format.');
      } finally {
        setCompressingStory(false);
      }
    }
    e.target.value = '';
  };

  const handleMultiStoryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    setProcessingMultiImages(true);
    try {
      const fileArray = Array.from(files).slice(0, 10);
      const compressedList: string[] = [];

      for (const file of fileArray) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1080, 1920, 0.75);
          compressedList.push(compressed);
        }
      }

      if (compressedList.length > 0) {
        setStoryMediaUrls(compressedList);
        setStoryMediaType('image');
        setStoryMediaUrl(compressedList[0]);
        setStoryTotalDuration(getStoryTierDuration(compressedList.length));
      }
    } catch {
      alert('Failed to process images. Please ensure the files are in JPG or PNG format.');
    } finally {
      setProcessingMultiImages(false);
      e.target.value = '';
    }
  };

  const handleMoveStoryImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storyMediaUrls.length) return;

    const updated = [...storyMediaUrls];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setStoryMediaUrls(updated);
    setStoryMediaUrl(updated[0]);
  };

  const handleRemoveStoryImage = (index: number) => {
    const updated = storyMediaUrls.filter((_, i) => i !== index);
    setStoryMediaUrls(updated);

    if (updated.length > 0) {
      setStoryMediaUrl(updated[0]);
      setStoryTotalDuration(getStoryTierDuration(updated.length));
    } else {
      setStoryMediaUrl('');
      setStoryTotalDuration(25);
    }
  };

  const handleAddStoryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    const remainingSlots = 10 - storyMediaUrls.length;
    if (remainingSlots <= 0) {
      alert('Maximum limit reached. You can only add up to 10 images.');
      e.target.value = '';
      return;
    }

    setProcessingMultiImages(true);
    try {
      const fileArray = Array.from(files).slice(0, remainingSlots);
      const newCompressedList: string[] = [];

      for (const file of fileArray) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1080, 1920, 0.75);
          newCompressedList.push(compressed);
        }
      }

      if (newCompressedList.length > 0) {
        const combined = [...storyMediaUrls, ...newCompressedList];
        setStoryMediaUrls(combined);
        setStoryMediaType('image');
        if (!storyMediaUrl) setStoryMediaUrl(combined[0]);
        setStoryTotalDuration(getStoryTierDuration(combined.length));
      }
    } catch {
      alert('Failed to process images.');
    } finally {
      setProcessingMultiImages(false);
      e.target.value = '';
    }
  };

  const handleAddUrlToCarousel = () => {
    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    const targetUrl = directMediaUrl.trim() || (!storyMediaUrl.startsWith('data:') ? storyMediaUrl.trim() : '');
    if (!targetUrl || targetUrl.startsWith('data:')) {
      alert('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }

    if (storyMediaUrls.length >= 10) {
      alert('Maximum limit reached. You can only add up to 10 images.');
      return;
    }

    const updated = [...storyMediaUrls, targetUrl];
    setStoryMediaUrls(updated);
    setStoryMediaType('image');
    setStoryMediaUrl(updated[0]);
    setStoryTotalDuration(getStoryTierDuration(updated.length));
    setDirectMediaUrl('');
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyMediaType === 'video' && !isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    const currentMedia = storyMediaUrls.length > 0 ? storyMediaUrls[0] : directMediaUrl.trim() || storyMediaUrl;
    if (!currentMedia.trim()) {
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
          media_url: currentMedia,
          caption: storyCaption.trim(),
          audio_url: storyAudioUrl.trim() || null,
          link_url: storyLinkUrl.trim() || null,
          duration: plannedDuration,
          media_urls: storyMediaUrls.length > 0 ? JSON.stringify(storyMediaUrls) : null,
          animation_style: storyAnimationStyle,
          total_duration: isProUser ? storyTotalDuration : 10,
        }),
      });

      if (res.ok) {
        setStorySuccess(true);
        setStoryMediaUrl('');
        setDirectMediaUrl('');
        setStoryCaption('');
        setStoryAudioUrl('');
        setStoryLinkUrl('');
        setSelectedTrackTitle('');
        setStoryMediaUrls([]);
        setStoryAnimationStyle('slide');
        setStoryTotalDuration(25);
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
      const res = await fetch(
        `/api/stories?id=${encodeURIComponent(storyId)}&username=${encodeURIComponent(activeUsername)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
      } else {
        alert('Failed to delete story.');
      }
    } catch {
      alert('Network error while deleting story.');
    } finally {
      setDeletingStoryId(null);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>24h Profile Stories</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Status
            </span>
          </h1>

          <span
            className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold border flex items-center gap-1.5 w-fit ${
              isProUser
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
          >
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

      {/* Story Form */}
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
                {isProUser
                  ? 'Select how long your photo story remains on screen.'
                  : 'Free tier is fixed to 10 seconds. Upgrade to unlock longer durations.'}
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

        {/* Media Preview Box */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
            {storyMediaUrl ? (
              storyMediaType === 'video' ? (
                <video src={storyMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
              ) : (
                <img src={storyMediaUrl} alt="Story preview" className="w-full h-full object-cover" />
              )
            ) : storyMediaType === 'video' ? (
              <VideoIcon className="w-8 h-8 text-neutral-600" />
            ) : (
              <ImageIcon className="w-8 h-8 text-neutral-600" />
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 w-full text-center sm:text-left">
            <p className="text-xs font-bold text-white">
              {storyMediaType === 'video'
                ? 'Story Video Clip (PRO Only)'
                : `Story Photo / Poster (${plannedDuration}s)`}
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

        {/* Multi-Image Carousel (PRO Only) */}
        {isProUser && (
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                Multi-Image Carousel
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                {storyMediaUrls.length > 0
                  ? `${storyMediaUrls.length} images selected (${storyTotalDuration}s total)`
                  : 'Max 10 Images'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 cursor-pointer transition flex items-center gap-2">
                <span>{processingMultiImages ? 'Processing...' : '📁 Select Multiple Images'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={processingMultiImages}
                  onChange={handleMultiStoryImagesUpload}
                  className="hidden"
                />
              </label>
              {storyMediaUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStoryMediaUrls([]);
                    setStoryMediaUrl('');
                    setStoryTotalDuration(25);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition"
                >
                  Reset All
                </button>
              )}
            </div>

            {storyMediaUrls.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[11px] text-neutral-400">
                  Order slides (Left = First, Right = Last):
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
                  {storyMediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group shrink-0 w-24 h-32 rounded-xl border border-neutral-700 overflow-hidden bg-neutral-950 flex flex-col justify-between p-1.5 shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Slide ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-cover -z-0 opacity-80 group-hover:opacity-100 transition"
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-amber-400 border border-white/10">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStoryImage(idx)}
                          className="p-1 rounded-md bg-black/70 hover:bg-rose-500/80 text-white transition"
                          title="Remove this image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-1 mt-auto bg-black/60 backdrop-blur-md rounded-lg p-0.5 border border-white/10">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStoryImage(idx, 'left')}
                          className="flex-1 py-1 flex items-center justify-center text-white hover:text-amber-400 disabled:opacity-20 transition"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] text-neutral-400 font-bold select-none">•</span>
                        <button
                          type="button"
                          disabled={idx === storyMediaUrls.length - 1}
                          onClick={() => handleMoveStoryImage(idx, 'right')}
                          className="flex-1 py-1 flex items-center justify-center text-white hover:text-amber-400 disabled:opacity-20 transition"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {storyMediaUrls.length < 10 && (
                    <label className="shrink-0 w-24 h-32 rounded-xl border border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-950/60 hover:bg-neutral-900 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-neutral-400 hover:text-amber-400 transition group shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-neutral-800 group-hover:bg-amber-400/20 border border-neutral-700 group-hover:border-amber-400/40 flex items-center justify-center transition">
                        <Plus className="w-4 h-4 text-neutral-300 group-hover:text-amber-400" />
                      </div>
                      <span className="text-[10px] font-bold">Add Photo</span>
                      <span className="text-[8px] text-neutral-500">
                        ({10 - storyMediaUrls.length} left)
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={processingMultiImages}
                        onChange={handleAddStoryImages}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {storyMediaUrls.length > 1 && (
              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="text-xs text-neutral-400">Transition Effect:</span>
                <div className="flex gap-1.5">
                  {(['slide', 'fade', 'zoom'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setStoryAnimationStyle(style)}
                      className={`px-3 py-1 text-xs rounded-lg border capitalize transition font-medium ${
                        storyAnimationStyle === style
                          ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Direct URL Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-neutral-400 block">
              Or paste direct media URL ({storyMediaType === 'video' ? 'Video .mp4' : 'Image .jpg/.png'})
            </label>
            {isProUser && storyMediaType === 'image' && storyMediaUrls.length > 0 && (
              <span className="text-[10px] text-amber-400 font-medium">
                Carousel: {storyMediaUrls.length}/10 Images
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="url"
              placeholder={
                storyMediaType === 'video'
                  ? 'https://example.com/video.mp4'
                  : 'https://images.unsplash.com/photo-...'
              }
              value={directMediaUrl || (storyMediaUrl.startsWith('data:') ? '' : storyMediaUrl)}
              onChange={(e) => {
                const val = e.target.value;
                setDirectMediaUrl(val);
                if (storyMediaUrls.length === 0) setStoryMediaUrl(val);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition ${
                storyMediaType === 'image' ? 'pr-12' : ''
              }`}
            />
            {storyMediaType === 'image' && (
              <button
                type="button"
                onClick={handleAddUrlToCarousel}
                title={isProUser ? 'Add image URL to Carousel' : 'Unlock Multi-Image Carousel (PRO)'}
                className="absolute right-1.5 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                {!isProUser && <Lock className="w-2.5 h-2.5 text-neutral-950" />}
              </button>
            )}
          </div>
        </div>

        {/* Caption */}
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

        {/* Link Sticker */}
        <div>
          <label className="text-[11px] text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
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

        {/* Background Soundtrack */}
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
                <p className="text-[11px] text-neutral-500 p-3 col-span-2 text-center">No soundtracks available.</p>
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
              )}

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
          disabled={
            postingStory ||
            (!storyMediaUrl && !directMediaUrl && storyMediaUrls.length === 0) ||
            compressingStory
          }
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
        >
          <Radio className="w-4 h-4" />
          <span>{postingStory ? 'Publishing Story...' : `Publish Story (${plannedDuration}s)`}</span>
        </button>
      </form>

      {/* Active Stories List */}
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
  );
}