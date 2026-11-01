'use client';

import React, { useRef, useState } from 'react';
import {
  Palette,
  Lock,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Disc3,
  AlertTriangle,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { ProfileData, MusicTrack, THEME_OPTIONS } from '../types';
import { compressImage } from '../utils/mediaUtils';

interface TabThemesProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  isProUser: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  handleSaveProfile: (e?: React.FormEvent) => Promise<void>;
  savingProfile: boolean;
  profileSavedSuccess: boolean;
  musicTracks: MusicTrack[];
  activeUsername: string;
}

export default function TabThemes({
  profile,
  setProfile,
  isProUser,
  setShowUpgradeModal,
  handleSaveProfile,
  savingProfile,
  profileSavedSuccess,
  musicTracks,
  activeUsername,
}: TabThemesProps) {
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const bgMusicFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBgMusic, setUploadingBgMusic] = useState(false);

  // Background Wallpaper Upload Handler
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

  // Background Audio Upload Handler
  const handleBgMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Audio file is too large. Please select an audio file under 25MB.');
      e.target.value = '';
      return;
    }

    setUploadingBgMusic(true);
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
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        setProfile((prev) => ({
          ...prev,
          bg_music_url: data.url,
          bg_music_title: cleanTitle,
        }));
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to upload background audio.');
      }
    } catch {
      alert('Network error while uploading audio.');
    } finally {
      setUploadingBgMusic(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" />
          <span>Themes &amp; Visual Styling</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Personalize your bio page appearance with curated color palettes, custom wallpapers, and background music.
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

        {/* Profile Background Music (PRO Only) */}
        <div className="pt-5 border-t border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Profile Background Music</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              </label>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ambient soundtrack that plays when visitors view your live bio link.
              </p>
            </div>
            {isProUser && profile.bg_music_url && (
              <button
                type="button"
                onClick={() => setProfile((prev) => ({ ...prev, bg_music_url: '', bg_music_title: '' }))}
                className="text-xs text-rose-400 hover:underline"
              >
                Remove Audio
              </button>
            )}
          </div>

          {!isProUser ? (
            <div
              onClick={() => setShowUpgradeModal(true)}
              className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Unlock Background Music</p>
                  <p className="text-[10px] text-neutral-400">Add custom soundtracks to your public bio link profile</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs">
                PRO Feature
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              {profile.bg_music_url ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2.5 truncate">
                    <Disc3 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">
                        {profile.bg_music_title || 'Custom Background Soundtrack'}
                      </span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {profile.bg_music_url}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, bg_music_url: '', bg_music_title: '' }))}
                    className="text-[11px] text-rose-400 hover:underline shrink-0 ml-2"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic">No background music currently attached to your profile.</p>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  disabled={uploadingBgMusic}
                  onClick={() => bgMusicFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition disabled:opacity-50 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{uploadingBgMusic ? 'Uploading Audio...' : 'Upload MP3 File'}</span>
                </button>

                <span className="text-xs text-neutral-600 hidden sm:inline">or</span>

                <input
                  type="url"
                  placeholder="Paste direct audio URL (.mp3)"
                  value={profile.bg_music_url || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      bg_music_url: e.target.value,
                      bg_music_title: prev.bg_music_title || 'Custom Audio URL',
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />

                <input
                  type="file"
                  ref={bgMusicFileInputRef}
                  accept="audio/mp3,audio/*"
                  onChange={handleBgMusicUpload}
                  className="hidden"
                />
              </div>

              {musicTracks.length > 0 && (
                <div className="pt-2 border-t border-neutral-900">
                  <label className="text-[10px] text-neutral-400 block mb-1.5 font-medium">
                    Or select from Global Creator Music Library:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {musicTracks.map((trk) => (
                      <button
                        key={trk.id}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            bg_music_url: trk.url,
                            bg_music_title: trk.title,
                          }))
                        }
                        className={`p-2 rounded-lg border text-left text-[11px] flex items-center justify-between transition ${
                          profile.bg_music_url === trk.url
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-neutral-850 bg-neutral-900 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="truncate font-medium">{trk.title}</span>
                        <span className="text-[9px] text-neutral-500 shrink-0 ml-1">{trk.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 mt-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-[11px] text-neutral-300 leading-relaxed">
                  <strong className="text-amber-400">Copyright &amp; Audio Disclaimer:</strong>
                  <span>
                    It is highly recommended to use <strong>royalty-free or Creative Commons music</strong>. If you choose to use copyrighted music without proper licensing, you assume full personal legal responsibility; <strong>Curiolot assumes zero liability</strong> for any copyright notices or infringement.
                  </span>
                  <span className="text-[10px] text-neutral-400 border-t border-amber-500/20 pt-1 mt-0.5">
                    💡 <em>Audio Synchronization: When a visitor un-mutes or plays your Showcase Video on your live profile, background music will automatically mute itself so the two tracks never overlap.</em>
                  </span>
                </div>
              </div>
            </div>
          )}
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
  );
}
export { TabThemes };