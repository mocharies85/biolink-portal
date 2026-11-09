'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Link as LinkIcon,
  Sparkles,
  Clock,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Upload,
  Globe,
  Save,
  Loader2,
} from 'lucide-react';
import { ProfileData, CurrentUser } from '../types';

interface TabProfileProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  activeUsername: string;
  isProUser: boolean;
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  setShowUpgradeModal: (show: boolean) => void;
  savingProfile?: boolean;
  profileSavedSuccess?: boolean;
  onSaveProfile?: (e?: React.FormEvent) => Promise<void>;
}

export default function TabProfile({
  profile,
  setProfile,
  activeUsername,
  isProUser,
  currentUser,
  setCurrentUser,
  setShowUpgradeModal,
  savingProfile: externalSaving,
  profileSavedSuccess: externalSuccess,
  onSaveProfile,
}: TabProfileProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  // Uploading states to Cloudflare R2
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  // Username and Biolink Handle States
  const [editUsername, setEditUsername] = useState(activeUsername || '');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Local Save States (Fallback if not provided from parent)
  const [internalSaving, setInternalSaving] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);

  const saving = externalSaving !== undefined ? externalSaving : internalSaving;
  const savedSuccess = externalSuccess !== undefined ? externalSuccess : internalSuccess;

  // Copy Biolink URL to Clipboard
  const handleCopyBiolink = () => {
    const fullUrl = `https://link.curiolot.com/${activeUsername || ''}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    }
  };

  // Native Web Share Dialog with Fallback to Copy
  const handleShareBiolink = async () => {
    const fullUrl = `https://link.curiolot.com/${activeUsername || ''}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `@${activeUsername} | Curiolot Link`,
          text: `Check out my biolink hub:`,
          url: fullUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      handleCopyBiolink();
    }
  };

  // Username / Biolink Handle Update Handler
  const handleUpdateUsername = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = editUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!clean || clean === activeUsername.toLowerCase()) return;

    setIsSavingUsername(true);
    setUsernameError('');
    setUsernameSuccess('');

    try {
      const res = await fetch('/api/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentUsername: activeUsername,
          newUsername: clean,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUsernameError(data.error || 'Failed to update username.');
      } else {
        const updatedUser = {
          ...currentUser!,
          username: data.newUsername || clean,
          last_username_change: Date.now(),
        };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('curiolot_auth_user', JSON.stringify(updatedUser));
        setUsernameSuccess(data.message || 'Username successfully updated!');

        setTimeout(() => {
          setUsernameSuccess('');
          router.replace('/admin');
        }, 1500);
      }
    } catch {
      setUsernameError('Network error while updating username.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Direct Avatar Upload to Cloudflare R2
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', activeUsername || 'creator');
    formData.append('folder', 'media');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, avatar: data.url }));
      } else {
        alert(data.error || 'Failed to upload profile avatar to R2.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Network error while uploading avatar to R2.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Direct OpenGraph Banner Upload to Cloudflare R2 (PRO Only)
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    setUploadingOg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', activeUsername || 'creator');
    formData.append('folder', 'media');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, og_image: data.url }));
      } else {
        alert(data.error || 'Failed to upload social banner to R2.');
      }
    } catch (err) {
      console.error('Error uploading OG banner:', err);
      alert('Network error while uploading social banner.');
    } finally {
      setUploadingOg(false);
      if (ogFileInputRef.current) ogFileInputRef.current.value = '';
    }
  };

  // Save Profile Handler
  const handleInternalSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSaveProfile) {
      await onSaveProfile(e);
      return;
    }

    setInternalSaving(true);
    setInternalSuccess(false);

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
        setInternalSuccess(true);
        setTimeout(() => setInternalSuccess(false), 3000);
      } else {
        alert('Failed to save profile settings.');
      }
    } catch {
      alert('Network error while saving profile.');
    } finally {
      setInternalSaving(false);
    }
  };

  return (
    <div className="max-w-xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Profile &amp; Bio</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Customize how your bio hub appears to your visitors.
        </p>
      </div>

      {/* Biolink URL Handle Box */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biolink URL Handle</span>
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Customize your public link address.
            </p>
          </div>
          {isProUser ? (
            <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PRO: Unlimited Changes
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-400 text-[10px] font-medium rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-500" /> Free: 48h Cooldown
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-500 flex-1 focus-within:border-emerald-500/60 transition">
            <span className="shrink-0 select-none">link.curiolot.com/</span>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder={activeUsername || 'username'}
              className="bg-transparent text-white font-semibold outline-none flex-1 ml-0.5 placeholder:text-neutral-700 min-w-0 pr-2"
            />

            {/* Copy Link & Native Share Action Buttons */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                type="button"
                onClick={handleCopyBiolink}
                title={copiedHandle ? 'Copied!' : 'Copy Link'}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                  copiedHandle
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {copiedHandle ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">Copied</span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleShareBiolink}
                title="Share Biolink"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdateUsername}
            disabled={isSavingUsername || !editUsername.trim() || editUsername.trim().toLowerCase() === activeUsername.toLowerCase()}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            {isSavingUsername ? 'Saving...' : 'Update'}
          </button>
        </div>

        {usernameError && (
          <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {usernameError}
          </p>
        )}
        {usernameSuccess && (
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {usernameSuccess}
          </p>
        )}
      </div>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleInternalSave} className="flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
          {/* Avatar Upload */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">Profile Avatar</label>
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="relative group">
                <img
                  src={profile.avatar || '/default-avatar.svg'}
                  alt={profile.name || 'Avatar'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/40 shadow-lg group-hover:opacity-80 transition bg-neutral-900"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer disabled:cursor-not-allowed"
                  title="Upload new avatar"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <p className="text-xs font-bold text-white">Upload New Image</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Direct upload to Cloudflare R2 storage. Supports JPG, PNG, and WebP.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>Uploading to R2...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Choose File</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Display Name */}
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

          {/* Tagline */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Tagline / Role</label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Bio */}
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

          {/* Social Media Icons Bar */}
          <div className="pt-4 border-t border-neutral-800">
            <label className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
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
                    socials: { ...profile.socials, instagram: e.target.value },
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
                    socials: { ...profile.socials, whatsapp: e.target.value },
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
                    socials: { ...profile.socials, tiktok: e.target.value },
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
                    socials: { ...profile.socials, youtube: e.target.value },
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
                    socials: { ...profile.socials, x: e.target.value },
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
                    socials: { ...profile.socials, github: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Facebook (Username / Page)</label>
                <input
                  type="text"
                  placeholder="e.g. yourpage"
                  value={profile.socials?.facebook || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    socials: { ...profile.socials, facebook: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">LinkedIn (Username)</label>
                <input
                  type="text"
                  placeholder="e.g. yourname"
                  value={profile.socials?.linkedin || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    socials: { ...profile.socials, linkedin: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Discord (Invite Link)</label>
                <input
                  type="text"
                  placeholder="https://discord.gg/..."
                  value={profile.socials?.discord || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    socials: { ...profile.socials, discord: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Twitch (Channel)</label>
                <input
                  type="text"
                  placeholder="e.g. channelname"
                  value={profile.socials?.twitch || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    socials: { ...profile.socials, twitch: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Custom Social Share Card & OpenGraph (PRO Only) */}
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
                      className="w-20 h-11 object-cover rounded-lg border border-neutral-700 bg-neutral-950"
                    />
                  )}
                  <button
                    type="button"
                    disabled={uploadingOg}
                    onClick={() => {
                      if (!isProUser) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      ogFileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {uploadingOg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span>Uploading to R2...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{profile.og_image ? 'Change Banner' : 'Upload Banner'}</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={ogFileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleOgImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          {savedSuccess && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Profile &amp; Socials saved successfully!
            </p>
          )}
          <button
            type="submit"
            disabled={saving || uploadingAvatar || uploadingOg}
            className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}