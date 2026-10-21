'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  Mail,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Trash2,
  TrendingUp,
  MousePointerClick,
  Link2,
  Radio,
  Search,
  Award,
  Disc3,
  Play,
  Pause,
  Upload,
  Plus,
  Check,
  Share2,
  Gift,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role?: string;
  is_pro?: number;
  pro_type?: 'free' | 'paid' | 'gift';
  pro_expires_at?: string | null;
  created_at?: number | string;
  total_views?: number;
  total_links?: number;
  total_clicks?: number;
  active_stories?: number;
}

interface MessageRecord {
  id: number;
  username: string;
  email: string;
  message: string;
  status?: string;
  created_at: number;
}

interface MusicTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  url: string;
}

interface AdminData {
  stats: {
    total: number;
    pro: number;
    paid_pro?: number;
    gift_pro?: number;
    free: number;
    estimatedRevenue: number;
  };
  users: UserRecord[];
  messages: MessageRecord[];
}

// Fungsi pembantu penghitung mundur sisa masa aktif PRO
function formatCountdown(expiresAt: string | null | undefined, proType?: string): { text: string; color: string; isUrgent: boolean } {
  if (!expiresAt) {
    return { text: 'Lifetime / Forever', color: 'text-neutral-400', isUrgent: false };
  }

  const target = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { text: 'Expired', color: 'text-rose-400 font-semibold', isUrgent: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let durationText = '';
  if (days > 0) {
    durationText = `${days}d ${hours}h left`;
  } else {
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    durationText = `${hours}h ${mins}m left`;
  }

  const prefix = proType === 'paid' ? 'Renews: ' : 'Expires: ';
  const isUrgent = days <= 3; // Peringatan jika sisa waktu <= 3 hari

  return {
    text: `${prefix}${durationText}`,
    color: isUrgent ? 'text-amber-400 font-semibold' : 'text-neutral-400',
    isUrgent,
  };
}

export default function SuperAdminPage() {
  const router = useRouter();

  // Authentication & PIN states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Data states
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'messages' | 'music' | 'seo'>('members');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Search & Delete states
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  // Gift PRO Modal states
  const [giftTargetUser, setGiftTargetUser] = useState<UserRecord | null>(null);
  const [giftDurationDays, setGiftDurationDays] = useState<number | null>(30);
  const [grantingGift, setGrantingGift] = useState(false);

  // Music Manager states
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackCategory, setNewTrackCategory] = useState('Relax / Aesthetic');
  const [newTrackDuration, setNewTrackDuration] = useState('1:30');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null);
  const superadminAudioRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // SEO & Social Card states
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoImage, setSeoImage] = useState('');
  const [savingSeo, setSavingSeo] = useState(false);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [uploadingSeoImage, setUploadingSeoImage] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  const seoImageInputRef = useRef<HTMLInputElement>(null);

  // Validate saved PIN session
  useEffect(() => {
    const savedPin = sessionStorage.getItem('curiolot_superadmin_pin');
    if (savedPin) {
      validateAndFetchData(savedPin);
    }
  }, []);

  const fetchMusicTracks = async () => {
    setLoadingMusic(true);
    try {
      const res = await fetch('/api/music');
      if (res.ok) {
        const data = await res.json();
        setMusicTracks(Array.isArray(data.tracks) ? data.tracks : []);
      }
    } catch (err) {
      console.error('Failed to load music tracks:', err);
    } finally {
      setLoadingMusic(false);
    }
  };

  const fetchSeoSettings = async () => {
    setLoadingSeo(true);
    try {
      const res = await fetch('/api/admin/seo');
      if (res.ok) {
        const json = await res.json();
        setSeoTitle(json.seo_title || '');
        setSeoDesc(json.seo_description || '');
        setSeoImage(json.seo_image || '');
      }
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
    } finally {
      setLoadingSeo(false);
    }
  };

  const validateAndFetchData = async (pin: string) => {
    setLoading(true);
    setPinError('');
    try {
      const cleanPin = pin.trim();
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-pin': cleanPin,
        },
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
        setIsUnlocked(true);
        sessionStorage.setItem('curiolot_superadmin_pin', cleanPin);
        fetchMusicTracks();
        fetchSeoSettings();
      } else {
        const errData = await res.json().catch(() => null);
        sessionStorage.removeItem('curiolot_superadmin_pin');
        setIsUnlocked(false);

        if (res.status === 401) {
          setPinError('Invalid security PIN. Access denied.');
        } else {
          setPinError(errData?.error || `Server responded with status ${res.status}.`);
        }
      }
    } catch {
      setPinError('Network connection error. Try again.');
    } finally {
      setLoading(false);
      setVerifyingPin(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setVerifyingPin(true);
    setPinError('');
    validateAndFetchData(pinInput.trim());
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem('curiolot_superadmin_pin');
    setIsUnlocked(false);
    setPinInput('');
    setData(null);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewingTrackId(null);
  };

  // Revoke PRO status
  const handleRevokePro = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to revoke PRO status for @${username}?`)) return;

    const savedPin = sessionStorage.getItem('curiolot_superadmin_pin') || pinInput.trim();
    setActionLoadingId(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': savedPin,
        },
        body: JSON.stringify({
          userId,
          username,
          action: 'revoke',
          is_pro: 0,
          pro_type: 'free',
        }),
      });

      if (res.ok) {
        await validateAndFetchData(savedPin);
      } else {
        alert('Failed to revoke PRO status.');
      }
    } catch {
      alert('Network error while revoking PRO status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Grant Gift PRO with selected duration
  const handleGrantGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTargetUser) return;

    const savedPin = sessionStorage.getItem('curiolot_superadmin_pin') || pinInput.trim();
    setGrantingGift(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': savedPin,
        },
        body: JSON.stringify({
          userId: giftTargetUser.id,
          username: giftTargetUser.username,
          action: 'grant_gift',
          pro_type: 'gift',
          duration_days: giftDurationDays,
        }),
      });

      if (res.ok) {
        setGiftTargetUser(null);
        await validateAndFetchData(savedPin);
      } else {
        alert('Failed to grant Gift PRO status.');
      }
    } catch {
      alert('Network error while granting Gift PRO status.');
    } finally {
      setGrantingGift(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    const savedPin = sessionStorage.getItem('curiolot_superadmin_pin') || pinInput.trim();
    setDeletingUser(deleteTarget.username);

    try {
      const res = await fetch(`/api/admin/users?username=${encodeURIComponent(deleteTarget.username)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-pin': savedPin,
        },
      });

      if (res.ok) {
        setDeleteTarget(null);
        await validateAndFetchData(savedPin);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user.');
      }
    } catch {
      alert('Network error while deleting user account.');
    } finally {
      setDeletingUser(null);
    }
  };

  // Audio Play/Pause Preview
  const handleToggleMusicPreview = (track: MusicTrack) => {
    if (!previewAudioRef.current) return;

    if (previewingTrackId === track.id) {
      previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    } else {
      previewAudioRef.current.src = track.url;
      previewAudioRef.current.play().catch(() => {});
      setPreviewingTrackId(track.id);
    }
  };

  // Upload MP3 to Storage via API
  const handleSuperadminAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', 'superadmin_library');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setNewTrackUrl(result.url);
        if (!newTrackTitle) {
          setNewTrackTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to upload MP3 file to storage.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while uploading MP3.');
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  // Add Track to Database
  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !newTrackUrl.trim()) {
      alert('Please provide a track title and upload or paste an MP3 audio URL.');
      return;
    }

    setUploadingAudio(true);
    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTrackTitle.trim(),
          category: newTrackCategory.trim(),
          duration: newTrackDuration.trim() || '1:30',
          url: newTrackUrl.trim(),
        }),
      });

      if (res.ok) {
        setNewTrackTitle('');
        setNewTrackUrl('');
        fetchMusicTracks();
        alert('Soundtrack successfully added to global creator library!');
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to add soundtrack.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving soundtrack.');
    } finally {
      setUploadingAudio(false);
    }
  };

  // Delete Track from Database
  const handleDeleteTrack = async (id: string) => {
    if (!confirm('Are you sure you want to remove this soundtrack from the global library?')) return;

    setDeletingTrackId(id);
    try {
      const res = await fetch(`/api/music?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setMusicTracks((prev) => prev.filter((t) => t.id !== id));
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to delete soundtrack.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting soundtrack.');
    } finally {
      setDeletingTrackId(null);
    }
  };

  // Upload Social Card Banner Image
  const handleSeoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSeoImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', 'seo_promo_card');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setSeoImage(result.url);
      } else {
        alert('Failed to upload banner image.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while uploading banner image.');
    } finally {
      setUploadingSeoImage(false);
      e.target.value = '';
    }
  };

  // Save Social Card Settings
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seo_title: seoTitle.trim(),
          seo_description: seoDesc.trim(),
          seo_image: seoImage.trim(),
        }),
      });

      if (res.ok) {
        setSeoSuccess(true);
        setTimeout(() => setSeoSuccess(false), 3500);
      } else {
        alert('Failed to update SEO card settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving SEO settings.');
    } finally {
      setSavingSeo(false);
    }
  };

  // Filter users by search
  const filteredUsers = (data?.users || []).filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Derive counts for display
  const paidProCount = data?.stats.paid_pro ?? (data?.users || []).filter((u) => u.is_pro === 1 && u.pro_type === 'paid').length;
  const giftProCount = data?.stats.gift_pro ?? (data?.users || []).filter((u) => u.is_pro === 1 && u.pro_type === 'gift').length;

  // Find top active creator
  const topCreator = [...(data?.users || [])].sort(
    (a, b) => ((b.total_views || 0) + (b.total_clicks || 0) * 2) - ((a.total_views || 0) + (a.total_clicks || 0) * 2)
  )[0];

  // 1. PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">Restricted Access</h1>
          <p className="text-xs text-neutral-400 mt-1.5 text-center leading-relaxed">
            Enter your administrator Master PIN to access the Superadmin Control Hub.
          </p>

          <form onSubmit={handleUnlock} className="w-full mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Security PIN / Passcode</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Master PIN"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition tracking-widest"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium text-center">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              disabled={verifyingPin}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <span>{verifyingPin ? 'Verifying...' : 'Unlock Control Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            <Link href="/admin" className="text-neutral-400 hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Member Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. UNLOCKED VIEW (SUPERADMIN CONTROL HUB)
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-8 font-sans">
      <audio ref={previewAudioRef} onEnded={() => setPreviewingTrackId(null)} />

      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
              title="Back to Member Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-xl font-bold text-white tracking-tight">Superadmin Control Hub</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  MASTER ACCESS
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Overview of user registrations, subscription tiers, promo cards, and global soundtracks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                validateAndFetchData(sessionStorage.getItem('curiolot_superadmin_pin') || pinInput.trim());
                fetchMusicTracks();
                fetchSeoSettings();
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={handleLockConsole}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-rose-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Total Registered</span>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{data?.stats.total ?? 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>PRO Subscribers</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">{data?.stats.pro ?? 0}</p>
            <p className="text-[10px] text-neutral-400 mt-1">
              <span className="text-amber-300 font-semibold">{paidProCount} Paid</span> • <span className="text-purple-400 font-semibold">{giftProCount} Gift</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Free Creators</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{data?.stats.free ?? 0}</p>
          </div>

          {/* Kartu Est. Revenue / Mo dengan Prediksi Perpanjangan */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Est. Revenue / Mo</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">${data?.stats.estimatedRevenue ?? 0}</p>
            <p className="text-[10px] text-emerald-400/90 mt-1">
              ${paidProCount * 3} projected active renewal
            </p>
          </div>
        </div>

        {/* Top Active Creator Spotlight Banner */}
        {topCreator && ((topCreator.total_views || 0) > 0 || (topCreator.total_clicks || 0) > 0) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  ⭐ Top Active Creator Spotlight
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  @{topCreator.username} <span className="text-neutral-400 font-normal">({topCreator.email})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Views</span>
                <span className="font-bold text-white">{topCreator.total_views || 0}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Clicks</span>
                <span className="font-bold text-emerald-400">{topCreator.total_clicks || 0}</span>
              </div>
              {topCreator.is_pro === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setGiftTargetUser(topCreator);
                    setGiftDurationDays(30);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Reward Gift PRO</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sub-navigation Tabs & Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'members' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Registered Users ({data?.users.length ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'messages' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Support Tickets ({data?.messages.length ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'music' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Music Library ({musicTracks.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('seo');
                fetchSeoSettings();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'seo' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Social Card &amp; SEO</span>
            </button>
          </div>

          {activeTab === 'members' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}
        </div>

        {/* TAB 1: User Management Table */}
        {activeTab === 'members' && (
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/60 shadow-xl">
            <div className="grid grid-cols-12 px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-xs font-bold text-neutral-400">
              <div className="col-span-4">User / Email</div>
              <div className="col-span-2">Plan Status</div>
              <div className="col-span-3">Activity Analytics</div>
              <div className="col-span-2">Public Bio Link</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-neutral-800 text-xs">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  {searchQuery ? `No registered users found matching "${searchQuery}".` : 'No registered users found.'}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = u.username.toLowerCase() === 'aries';
                  const activityScore = (u.total_views || 0) + (u.total_clicks || 0) * 2;

                  return (
                    <div key={u.id} className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-neutral-850/50 transition">
                      {/* User Info */}
                      <div className="col-span-4 truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-white truncate">@{u.username}</p>
                          {isOwner && (
                            <span className="text-[9px] px-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                              Owner
                            </span>
                          )}
                          {activityScore >= 10 && (
                            <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-0.5 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">{u.email}</p>
                      </div>

                      {/* Plan Status dengan Countdown Timer */}
                      <div className="col-span-2">
                        {u.is_pro === 1 ? (
                          <div className="flex flex-col gap-1">
                            {u.pro_type === 'gift' ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold inline-flex items-center gap-1 w-fit">
                                <Gift className="w-2.5 h-2.5" /> PRO Gift
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold inline-flex items-center gap-1 w-fit">
                                ★ PRO Paid
                              </span>
                            )}

                            {/* Real-time Countdown Timer Badge */}
                            {(() => {
                              const countdown = formatCountdown(u.pro_expires_at, u.pro_type);
                              return (
                                <span
                                  className={`text-[9px] flex items-center gap-1 ${countdown.color}`}
                                  title={u.pro_expires_at ? `Scheduled: ${new Date(u.pro_expires_at).toLocaleString()}` : 'No expiration date'}
                                >
                                  <Clock className="w-2.5 h-2.5 shrink-0" />
                                  <span>{countdown.text}</span>
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px] border border-neutral-700 w-fit inline-block">
                            Free Tier
                          </span>
                        )}
                      </div>

                      {/* Activity Analytics */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 text-neutral-300" title="Profile Page Views">
                            <Eye className="w-3 h-3 text-neutral-500" />
                            <strong>{u.total_views || 0}</strong>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400" title="Total Link Clicks">
                            <MousePointerClick className="w-3 h-3 text-emerald-500" />
                            <strong>{u.total_clicks || 0}</strong>
                          </span>
                          <span className="flex items-center gap-1 text-neutral-400" title="Active Links">
                            <Link2 className="w-3 h-3 text-neutral-500" />
                            <span>{u.total_links || 0}</span>
                          </span>
                          {(u.active_stories || 0) > 0 && (
                            <span className="flex items-center gap-1 text-emerald-400" title="Active Stories">
                              <Radio className="w-3 h-3 text-emerald-400" />
                              <span>{u.active_stories}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Public Bio Link */}
                      <div className="col-span-2 text-neutral-400 truncate">
                        <a
                          href={`/${u.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400 underline flex items-center gap-1 w-fit truncate"
                        >
                          <span className="truncate">/{u.username}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-600 shrink-0" />
                        </a>
                      </div>

                      {/* Admin Actions */}
                      <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                        {u.is_pro === 1 ? (
                          <button
                            type="button"
                            onClick={() => handleRevokePro(u.id, u.username)}
                            disabled={actionLoadingId === u.id}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-50"
                            title="Revoke PRO Status"
                          >
                            {actionLoadingId === u.id ? '...' : 'Revoke'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setGiftTargetUser(u);
                              setGiftDurationDays(30);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition flex items-center gap-1"
                            title="Gift PRO Access"
                          >
                            <Gift className="w-2.5 h-2.5" />
                            <span>Gift</span>
                          </button>
                        )}

                        {/* Delete Account (Hidden for Owner) */}
                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            className="p-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition"
                            title={`Delete account @${u.username}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Support Messages */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-3">
            {data?.messages.length === 0 ? (
              <div className="p-10 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-neutral-900 text-xs">
                No support messages or member inquiries received yet.
              </div>
            ) : (
              data?.messages.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">@{m.username}</span>
                      <span className="text-neutral-500 text-[11px]">({m.email})</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3.5 rounded-xl border border-neutral-850">
                    {m.message}
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <a
                      href={`mailto:${m.email}?subject=Response to Curiolot Support Inquiry`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Reply via Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Global Music Library Manager */}
        {activeTab === 'music' && (
          <div className="flex flex-col gap-6">
            
            {/* Form Upload MP3 Track */}
            <form onSubmit={handleAddTrack} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Upload New Soundtrack</span>
                </h3>
                <span className="text-[10px] text-neutral-400">Added tracks appear instantly on all user bio dashboards</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Track Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chill Wave Beats"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Category / Vibe</label>
                  <select
                    value={newTrackCategory}
                    onChange={(e) => setNewTrackCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="Relax / Aesthetic">Relax / Aesthetic</option>
                    <option value="Energetic / Promo">Energetic / Promo</option>
                    <option value="Acoustic / Warm">Acoustic / Warm</option>
                    <option value="Atmospheric / Elegant">Atmospheric / Elegant</option>
                    <option value="Tech / Futuristic">Tech / Futuristic</option>
                    <option value="Hip Hop / Beats">Hip Hop / Beats</option>
                    <option value="Cinematic / Epic">Cinematic / Epic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Duration Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1:45"
                    value={newTrackDuration}
                    onChange={(e) => setNewTrackDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Upload MP3 File or Direct URL */}
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <button
                  type="button"
                  disabled={uploadingAudio}
                  onClick={() => superadminAudioRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-emerald-400 text-xs font-semibold flex items-center gap-2 transition shrink-0 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingAudio ? 'Uploading MP3...' : 'Upload MP3 File'}</span>
                </button>

                <span className="text-xs text-neutral-500">or</span>

                <input
                  type="url"
                  placeholder="Paste direct audio link (e.g. https://.../audio.mp3)"
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                />

                <input
                  type="file"
                  ref={superadminAudioRef}
                  accept="audio/mp3,audio/*"
                  onChange={handleSuperadminAudioUpload}
                  className="hidden"
                />
              </div>

              {newTrackUrl && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between">
                  <span className="truncate pr-2 font-medium">Ready: {newTrackUrl}</span>
                  <Check className="w-4 h-4 shrink-0" />
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingAudio || !newTrackTitle || !newTrackUrl}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Save Track to Creator Library</span>
              </button>
            </form>

            {/* Active Soundtracks List */}
            <div>
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
                Active Library Soundtracks ({musicTracks.length})
              </h3>

              {loadingMusic ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Loading soundtracks from database...</p>
              ) : musicTracks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <Disc3 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Library is currently empty. Upload the first track above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {musicTracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-3 truncate flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleMusicPreview(track)}
                          className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition shrink-0"
                          title={previewingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                        >
                          {previewingTrackId === track.id ? (
                            <Pause className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Play className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>

                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-white truncate">{track.title}</p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {track.category} • {track.duration}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={deletingTrackId === track.id}
                        onClick={() => handleDeleteTrack(track.id)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition shrink-0 disabled:opacity-50"
                        title="Delete soundtrack"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: Custom Social Share Card & SEO Manager */}
        {activeTab === 'seo' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Custom Social Share Card &amp; Viral Promo SEO</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Customize the real-time preview card that appears when <strong>https://link.curiolot.com</strong> is posted on X (Twitter), WhatsApp, Telegram, or Facebook.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Form Input Setting */}
              <form onSubmit={handleSaveSeo} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">Promo Card Headline (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Claim Your Rare Vanity Handle — Curiolot Link"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-1">Appears as bold title on social timeline cards.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">Promo Pitch &amp; Hook (Description)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Short handles and 1-word usernames are still free to claim. Showcase your work with 24h stories & soundtracks."
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-1">Recommended 100–160 characters for optimal card visibility.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">Social Share Banner Image (1200 × 630 px)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      disabled={uploadingSeoImage}
                      onClick={() => seoImageInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingSeoImage ? 'Uploading...' : 'Upload Banner'}</span>
                    </button>

                    <input
                      type="url"
                      required
                      placeholder="Or paste direct image URL (https://...)"
                      value={seoImage}
                      onChange={(e) => setSeoImage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                    />

                    <input
                      type="file"
                      ref={seoImageInputRef}
                      accept="image/*"
                      onChange={handleSeoImageUpload}
                      className="hidden"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1">Optimal aspect ratio: 1.91:1 (Landscape).</span>
                </div>

                {seoSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Promo share card updated! Media bots will now fetch this new card.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingSeo || uploadingSeoImage || !seoTitle || !seoImage}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{savingSeo ? 'Updating Social Meta...' : 'Save & Publish Live Card'}</span>
                </button>
              </form>

              {/* Live Preview Display Card */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Live Twitter / X Timeline Preview</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400">Large Card</span>
                </span>
                
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 overflow-hidden shadow-2xl max-w-md">
                  <div className="w-full h-52 bg-neutral-950 overflow-hidden flex items-center justify-center border-b border-neutral-800/80">
                    {seoImage ? (
                      <img src={seoImage} alt="Card Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-neutral-600 text-xs">
                        <Upload className="w-6 h-6" />
                        <span>No banner image uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col gap-1 bg-neutral-900">
                    <span className="text-[11px] text-neutral-500 font-medium">link.curiolot.com</span>
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {seoTitle || 'Claim Your Rare Vanity Handle — Curiolot Link'}
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mt-0.5">
                      {seoDesc || 'Short handles and 1-word usernames are still free to claim. Showcase your work with 24h stories & soundtracks.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                  💡 <strong>Tips:</strong> Whenever you update the promo text or banner image here, platforms like X, WhatsApp, and Telegram will automatically serve this updated preview card when users share <code>link.curiolot.com</code>.
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Gift PRO Modal Dialog */}
      {giftTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <form
            onSubmit={handleGrantGift}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-left flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Grant Gift PRO Access</h3>
                <p className="text-xs text-neutral-400">@{giftTargetUser.username}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Gifted PRO accounts receive full PRO benefits without being factored into your monthly subscription revenue calculation.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Select Duration</span>
              </label>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { label: '7 Days', days: 7 },
                  { label: '30 Days (1 Mo)', days: 30 },
                  { label: '90 Days (3 Mo)', days: 90 },
                  { label: '1 Year (365d)', days: 365 },
                  { label: 'Lifetime / Forever', days: null },
                ].map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setGiftDurationDays(tier.days)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition ${
                      giftDurationDays === tier.days
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setGiftTargetUser(null)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={grantingGift}
                className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition disabled:opacity-50 shadow-lg shadow-purple-600/20"
              >
                {grantingGift ? 'Granting...' : 'Confirm Gift'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Safety Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">Delete User Account?</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">@{deleteTarget.username}</strong>?
            </p>
            <p className="text-[11px] text-rose-400/90 mt-1">
              All bio links, profile settings, stories, and messages belonging to this user will be erased from Cloudflare D1.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingUser === deleteTarget.username}
                onClick={handleDeleteUser}
                className="w-1/2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-xs transition disabled:opacity-50 shadow-lg shadow-rose-500/20"
              >
                {deletingUser === deleteTarget.username ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}