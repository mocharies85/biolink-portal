'use client';

import React, { useState, useRef } from 'react';
import {
  Link2,
  Video as VideoIcon,
  Upload,
  Save,
  Plus,
  Flame,
  Calendar,
  Lock,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { LinkItem, ProfileData } from '../types';

interface TabLinksProps {
  links: LinkItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  loadingLinks: boolean;
  activeUsername: string;
  isProUser: boolean;
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  setShowUpgradeModal: (show: boolean) => void;
  fetchLinks: () => Promise<void>;
  handleSaveProfile: (e?: React.FormEvent) => Promise<void>;
  savingProfile: boolean;
}

export default function TabLinks({
  links,
  setLinks,
  loadingLinks,
  activeUsername,
  isProUser,
  profile,
  setProfile,
  setShowUpgradeModal,
  fetchLinks,
  handleSaveProfile,
  savingProfile,
}: TabLinksProps) {
  const showcaseVideoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingShowcaseVideo, setUploadingShowcaseVideo] = useState(false);

  // Form States for Adding New Link
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsSpotlight, setNewIsSpotlight] = useState(false);
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isHeaderMode, setIsHeaderMode] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  // Edit Link Modal States
  const [editingItem, setEditingItem] = useState<LinkItem | null>(null);
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);

  // Schedule Badge Formatter
  const getScheduleBadge = (link: LinkItem) => {
    if (!link.schedule_start && !link.schedule_end) return null;
    const now = new Date().getTime();

    if (link.schedule_start) {
      const startTime = new Date(link.schedule_start).getTime();
      if (!isNaN(startTime) && now < startTime) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ⏳ Scheduled
          </span>
        );
      }
    }

    if (link.schedule_end) {
      const endTime = new Date(link.schedule_end).getTime();
      if (!isNaN(endTime) && now > endTime) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ⛔ Expired
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        🟢 Active Schedule
      </span>
    );
  };

  // Upload Showcase Video to Cloudflare R2
  const handleShowcaseVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isProUser) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Video file is too large. Please select an MP4 video under 50MB.');
      e.target.value = '';
      return;
    }

    setUploadingShowcaseVideo(true);
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
        setProfile((prev) => ({
          ...prev,
          featured_video_url: data.url,
          show_featured_video: 1,
        }));
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to upload showcase video.');
      }
    } catch {
      alert('Network error while uploading video.');
    } finally {
      setUploadingShowcaseVideo(false);
      e.target.value = '';
    }
  };

  // Add Link or Section Header
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!isHeaderMode && !newUrl.trim()) return;

    if (!isHeaderMode && !isProUser && links.filter((l) => l.is_header !== 1).length >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    setAddingLink(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          title: newTitle.trim(),
          url: isHeaderMode ? '' : newUrl.trim(),
          description: isHeaderMode ? '' : newDesc.trim(),
          is_spotlight: !isHeaderMode && isProUser && newIsSpotlight ? 1 : 0,
          schedule_start: !isHeaderMode && isProUser && scheduleStart ? scheduleStart : null,
          schedule_end: !isHeaderMode && isProUser && scheduleEnd ? scheduleEnd : null,
          pin_code: !isHeaderMode && isProUser && pinCode.trim() ? pinCode.trim() : null,
          is_header: isHeaderMode ? 1 : 0,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setNewDesc('');
        setNewIsSpotlight(false);
        setScheduleStart('');
        setScheduleEnd('');
        setPinCode('');
        setIsHeaderMode(false);
        fetchLinks();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add item.');
      }
    } catch {
      alert('Network error while adding item.');
    } finally {
      setAddingLink(false);
    }
  };

  // Toggle Spotlight
  const handleToggleSpotlight = async (link: LinkItem) => {
    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    const nextSpotlight = link.is_spotlight === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.id,
          username: activeUsername,
          is_spotlight: nextSpotlight,
        }),
      });

      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, is_spotlight: nextSpotlight } : l))
        );
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to toggle spotlight status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating spotlight.');
    }
  };

  // Reorder Links
  const handleMoveOrder = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [movedItem] = newLinks.splice(currentIndex, 1);
    newLinks.splice(targetIndex, 0, movedItem);
    setLinks(newLinks);

    try {
      const res = await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          orderedIds: newLinks.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        fetchLinks();
      }
    } catch {
      fetchLinks();
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    try {
      const res = await fetch(`/api/links?id=${id}&username=${activeUsername}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert('Failed to delete link.');
      }
    } catch {
      alert('Network error while deleting link.');
    }
  };

  // Save Link Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdatingLink(true);
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          username: activeUsername,
          title: editingItem.title || '',
          url: editingItem.url || '',
          description: editingItem.description || '',
          is_spotlight: editingItem.is_spotlight || 0,
          schedule_start: editingItem.schedule_start || null,
          schedule_end: editingItem.schedule_end || null,
          pin_code: editingItem.pin_code || '',
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchLinks();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save changes.');
      }
    } catch {
      alert('Network error while updating link.');
    } finally {
      setIsUpdatingLink(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white">Links &amp; Content</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your external links, portfolios, and highlight priority content with Spotlight.
          </p>
        </div>
        {!isProUser && (
          <div className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2 shrink-0">
            <span>Free Limit: {links.filter((l) => l.is_header !== 1).length}/3 Links</span>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="underline font-bold hover:text-amber-300"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* Product Showcase Video Card (PRO Only) */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                Product Showcase Video
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                  PRO
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Pin a presentation video directly at the top of your public bio profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isProUser) {
                setShowUpgradeModal(true);
                return;
              }
              setProfile((prev) => ({
                ...prev,
                show_featured_video: prev.show_featured_video === 1 ? 0 : 1,
              }));
            }}
            className={`w-11 h-6 rounded-full transition-colors p-1 relative flex items-center shrink-0 ${
              profile.show_featured_video === 1 ? 'bg-emerald-500' : 'bg-neutral-800'
            }`}
            title={profile.show_featured_video === 1 ? 'Disable Video' : 'Enable Video'}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                profile.show_featured_video === 1 ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {profile.show_featured_video === 1 && (
          <div className="space-y-3 pt-2 border-t border-neutral-800/80">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Video Headline (Optional)</label>
              <input
                type="text"
                disabled={!isProUser}
                placeholder="e.g. Watch Product Presentation"
                value={profile.featured_video_title || ''}
                onChange={(e) => setProfile({ ...profile, featured_video_title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="w-32 h-20 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                {profile.featured_video_url ? (
                  <video src={profile.featured_video_url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <VideoIcon className="w-6 h-6 text-neutral-600" />
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1 w-full text-center sm:text-left">
                <p className="text-xs font-semibold text-white">Upload Native MP4 Video</p>
                <p className="text-[10px] text-neutral-400">
                  Ad-free native streaming hosted on Cloudflare R2 (Max 50MB).
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={uploadingShowcaseVideo}
                    onClick={() => {
                      if (!isProUser) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      showcaseVideoInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{uploadingShowcaseVideo ? 'Uploading...' : profile.featured_video_url ? 'Replace Video' : 'Choose Video'}</span>
                  </button>
                  {profile.featured_video_url && (
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, featured_video_url: '' }))}
                      className="text-[11px] text-rose-400 hover:underline px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={showcaseVideoInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleShowcaseVideoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={profile.featured_video_autoplay === 1}
                onChange={(e) => setProfile({ ...profile, featured_video_autoplay: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Autoplay video automatically when profile is opened (starts muted per browser rules)</span>
            </label>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleSaveProfile()}
                disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Video Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Link / Section Header Form */}
      <form onSubmit={handleAddLink} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {isHeaderMode ? 'Add Section Header' : 'Add New Link'}
          </h3>

          <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px]">
            <button
              type="button"
              onClick={() => setIsHeaderMode(false)}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                !isHeaderMode
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Standard Link
            </button>
            <button
              type="button"
              onClick={() => setIsHeaderMode(true)}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                isHeaderMode
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Section Header
            </button>
          </div>
        </div>

        {isHeaderMode ? (
          <div>
            <input
              type="text"
              required
              placeholder="Section Title (e.g. Featured Projects, Social Channels, Merchandise)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[10px] text-neutral-500 mt-1.5">
              Section headers act as visual category dividers to group your links.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Link Title (e.g. My Portfolio)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <input
                type="url"
                required
                placeholder="https://yourlink.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {!isProUser && (newUrl.includes('spotify.com') || newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <span className="flex items-center gap-1.5 text-[11px]">
                  ⭐ <strong>Media Player Preview:</strong> Inline Spotify &amp; YouTube embeds are exclusive to PRO. This link will display as a standard card button on Free tier.
                </span>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[10px] hover:bg-amber-400 transition shrink-0 ml-2"
                >
                  Upgrade
                </button>
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Description or subtitle (optional, e.g. Free tools for digital creators)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Spotlight Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${newIsSpotlight ? 'text-amber-400' : 'text-neutral-500'}`} />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Spotlight Glow Animation
                    {!isProUser && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                        PRO
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    Highlight this link with an animated gold neon glow and HOT badge to boost clicks.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isProUser) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setNewIsSpotlight(!newIsSpotlight);
                }}
                className={`w-11 h-6 rounded-full transition-colors p-1 relative flex items-center ${
                  newIsSpotlight ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newIsSpotlight ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Smart Link Options */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Smart Link Options
                </span>
                {!isProUser && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    PRO Only
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-neutral-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-neutral-500" /> Schedule Start (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    disabled={!isProUser}
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-neutral-500" /> Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    disabled={!isProUser}
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 flex items-center gap-1 mb-1">
                  <Lock className="w-3 h-3 text-neutral-500" /> PIN Protection (Optional)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  disabled={!isProUser}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder={isProUser ? 'e.g. 123456' : 'PRO accounts only'}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={addingLink}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>
            {addingLink
              ? 'Adding...'
              : isHeaderMode
              ? 'Add Section Header'
              : 'Add Link to Bio'}
          </span>
        </button>
      </form>

      {/* Links List */}
      <div className="flex flex-col gap-2.5">
        {loadingLinks ? (
          <p className="text-xs text-neutral-500 py-6 text-center">Loading links...</p>
        ) : links.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <Link2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">No links added yet. Create your first link above.</p>
          </div>
        ) : (
          links.map((link, index) => {
            if (link.is_header === 1) {
              return (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                      Header
                    </span>
                    <p className="text-xs font-bold text-white uppercase tracking-wider truncate">
                      {link.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === links.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...link })}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition"
                      title="Edit Section Header"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition"
                      title="Delete Section Header"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            const isSpotlight = link.is_spotlight === 1;

            return (
              <div
                key={link.id}
                className={`p-4 rounded-2xl bg-neutral-900 border transition-all flex items-center justify-between gap-3 ${
                  isSpotlight
                    ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{link.title}</p>

                    {isSpotlight && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Spotlight
                      </span>
                    )}

                    {Boolean(link.pin_code && link.pin_code.trim().length > 0) && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold uppercase tracking-wider border border-rose-500/30 flex items-center gap-0.5" title={`PIN: ${link.pin_code}`}>
                        <Lock className="w-2.5 h-2.5" /> PIN Protected
                      </span>
                    )}

                    {link.schedule_start && new Date(link.schedule_start) > new Date() && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-0.5" title={`Starts at: ${link.schedule_start}`}>
                        <Calendar className="w-2.5 h-2.5" /> Scheduled
                      </span>
                    )}

                    {link.schedule_end && new Date(link.schedule_end) < new Date() && (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[9px] font-bold uppercase tracking-wider border border-neutral-700 flex items-center gap-0.5" title={`Expired at: ${link.schedule_end}`}>
                        <Calendar className="w-2.5 h-2.5" /> Expired
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">{link.url}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSpotlight(link)}
                    className={`p-2 rounded-xl transition ml-1 ${
                      isSpotlight
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300'
                    }`}
                    title="Toggle Spotlight"
                  >
                    <Flame className="w-4 h-4" />
                  </button>

                  <div className="px-2 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-center min-w-[38px]">
                    <span className="text-[10px] font-bold text-emerald-400 block leading-none">
                      {link.clicks || 0}
                    </span>
                    <span className="text-[8px] text-neutral-500 uppercase tracking-tighter">clicks</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...link })}
                    className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-500 hover:text-amber-400 transition"
                    title="Edit Link"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 rounded-xl bg-neutral-950 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Link & Smart Options Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingItem.is_header ? 'Edit Section Header' : 'Edit Link'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-neutral-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {!editingItem.is_header && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Destination URL</label>
                    <input
                      type="url"
                      required
                      value={editingItem.url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Smart Link Options</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Schedule Start</label>
                        <input
                          type="datetime-local"
                          value={editingItem.schedule_start || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, schedule_start: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Expiry Date</label>
                        <input
                          type="datetime-local"
                          value={editingItem.schedule_end || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, schedule_end: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">PIN Protection (Leave empty to remove PIN)</label>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="e.g. 123456"
                        value={editingItem.pin_code || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, pin_code: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingLink}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-neutral-950 transition disabled:opacity-50"
                >
                  {isUpdatingLink ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}