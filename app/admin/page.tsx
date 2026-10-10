'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User,
  Link2, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  Trash2, 
  ExternalLink, 
  MousePointerClick, 
  Inbox, 
  Sparkles, 
  Clock, 
  RefreshCw,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Save,
  CheckCircle2,
  Camera,
  Upload
} from 'lucide-react';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  desc?: string;
  clicks: number;
  is_active?: number | boolean;
  active?: boolean;
  is_highlighted?: number | boolean;
  highlight?: boolean;
}

interface MessageItem {
  id: number;
  sender: string;
  content: string;
  created_at?: string;
  is_read?: number;
}

interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
}

const ADMIN_SECRET_PIN = "123456";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Ref untuk tombol file upload tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('biolink_admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_SECRET_PIN) {
      sessionStorage.setItem('biolink_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid PIN! Access denied.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('biolink_admin_authenticated');
    setIsAuthenticated(false);
    setPinInput('');
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'messaging' | 'analytics'>('profile');

  const [profile, setProfile] = useState<ProfileData>({
    name: "Aries Creative Lab",
    tagline: "Digital Creator & Independent Developer",
    bio: "Crafting vector illustrations, interactive web experiences, and digital publications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error('Failed to load links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchLinks();
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Fungsi Upload & Kompres Gambar Otomatis (seperti medsos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Kompres gambar ke ukuran optimal avatar (400x400)
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Ubah menjadi data URL ringan berkualitas tinggi
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfile((prev) => ({ ...prev, avatar: optimizedDataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setProfileSavedSuccess(true);
        setTimeout(() => setProfileSavedSuccess(false), 4000);
      } else {
        alert('Failed to save profile changes.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setAddingLink(true);
    const formattedUrl = newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: formattedUrl,
          description: newDesc.trim(),
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setNewDesc('');
        fetchLinks();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to add link');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to remove this link?')) return;

    try {
      const res = await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert('Failed to delete link.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = messages.filter((m) => (m.is_read ?? 0) === 0).length;

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">Portal Admin Terkunci</h1>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
            Please enter your security PIN to access your settings and dashboard.
          </p>

          <form onSubmit={handleLogin} className="w-full mt-6 flex flex-col gap-3">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter PIN (Default: 123456)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-center tracking-widest text-neutral-100 placeholder:tracking-normal placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 mt-6 transition underline underline-offset-4"
          >
            ← Back to Public Bio-Link
          </a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row font-sans">
      
      {/* 1. Sidebar Kiri */}
      <aside className="w-full lg:w-64 bg-neutral-900/70 border-r border-neutral-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5 pb-6 border-b border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Curiolot Studio</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Creator Portal</span>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile &amp; Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'links'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Link2 className="w-4 h-4" />
                Links &amp; Content
              </span>
              <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-300">
                {links.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('messaging')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'messaging'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                Messaging &amp; Inbox
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-emerald-500 text-neutral-950 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Global Insights
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition border border-neutral-700"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition border border-rose-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock &amp; Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Panel Utama */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
        
        {/* TAB PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Profile &amp; Branding</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Customize your display identity, bio description, and profile picture.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
              
              {/* Bagian Upload Avatar Model Media Sosial */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-neutral-800">
                {/* Lingkaran Avatar Interaktif dengan Ikon Kamera */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer w-20 h-20 rounded-full shrink-0 shadow-lg"
                  title="Click to change profile picture"
                >
                  <img
                    src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 group-hover:opacity-80 transition"
                  />
                  <div className="absolute inset-0 bg-neutral-950/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <span className="text-[9px] text-white font-semibold mt-0.5">Change</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Tombol Upload File */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-white flex items-center gap-2 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload New Photo</span>
                    </button>

                    {/* Tombol Reset ke Foto Default */}
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({
                        ...prev,
                        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"
                      }))}
                      className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-400 hover:text-neutral-200 transition"
                    >
                      Reset
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    JPG, PNG, or WebP. Images are automatically optimized and cropped for bio-link profiles.
                  </p>

                  {/* Input File Tersembunyi (dibuka saat foto/tombol diklik) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Display Name / Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Aries | Curiolot Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Tagline / Professional Title
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="e.g. Creative Director & Independent Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Bio Description */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Bio Description
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell visitors about your creative projects and background..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="flex items-center justify-between pt-2">
                {profileSavedSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                  </span>
                ) : <div />}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB LINKS */}
        {activeTab === 'links' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Links &amp; Monetization</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage your bio buttons, external links, and featured products directly on Cloudflare D1.
                </p>
              </div>
              <button
                onClick={fetchLinks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLinks ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <form onSubmit={handleAddLink} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add New Link
              </h3>
              <input
                type="text"
                placeholder="Title (e.g. Adobe Stock Portfolio)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://stock.adobe.com/...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <input
                type="text"
                placeholder="Short Description / Subtitle (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={addingLink}
                className="self-end px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition disabled:opacity-50"
              >
                {addingLink ? 'Adding...' : 'Add Link Button'}
              </button>
            </form>

            {loadingLinks ? (
              <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
                Loading links from Cloudflare D1...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <div 
                    key={link.id}
                    className="p-4 rounded-2xl border transition flex items-center justify-between gap-4 bg-neutral-900 border-neutral-800"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{link.title}</span>
                        {(link.is_highlighted === 1 || link.highlight) && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 truncate mt-0.5">{link.url}</span>
                      <span className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3 text-emerald-400" /> {link.clicks?.toLocaleString() || 0} total clicks
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB MESSAGING */}
        {activeTab === 'messaging' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Messaging Inbox
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Direct inquiries received from your public bio-link.
                </p>
              </div>

              <button
                onClick={fetchMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingMessages ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                Loading messages from D1...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center">
                <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
                <h3 className="text-sm font-semibold text-neutral-300">No messages found</h3>
                <p className="text-xs text-neutral-500 mt-1">Inquiries sent by your profile visitors will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-5 rounded-2xl border transition flex flex-col gap-2 relative bg-neutral-900 border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <h4 className="text-xs font-bold text-neutral-100">{msg.sender}</h4>
                      </div>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {msg.created_at || 'Just now'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Global Insights &amp; Traffic</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Audience engagement metrics (US, Europe &amp; Global distribution).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-xs text-neutral-400">Total Page Views</span>
                <span className="text-2xl font-bold text-white mt-2">12,840</span>
                <span className="text-[10px] text-emerald-400 font-medium mt-1">↑ 24% vs last month</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-xs text-neutral-400">Total Link Clicks</span>
                <span className="text-2xl font-bold text-white mt-2">3,052</span>
                <span className="text-[10px] text-emerald-400 font-medium mt-1">↑ 18% vs last month</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-xs text-neutral-400">Click-Through Rate (CTR)</span>
                <span className="text-2xl font-bold text-emerald-400 mt-2">23.7%</span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1">Industry avg: 12%</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Simulator Real-Time */}
      <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
        <div className="w-full max-w-[280px] h-[560px] bg-neutral-950 rounded-[40px] border-4 border-neutral-800 shadow-2xl p-4 flex flex-col items-center relative overflow-hidden ring-1 ring-neutral-700/50">
          <div className="w-20 h-4 bg-neutral-800 rounded-full mb-4 shrink-0" />

          <div className="w-full flex-1 overflow-y-auto no-scrollbar flex flex-col items-center text-center">
            <img
              src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md mb-2"
            />
            <h4 className="text-xs font-bold text-white">{profile.name}</h4>
            <p className="text-[10px] text-emerald-400 font-medium">{profile.tagline}</p>
            <p className="text-[9px] text-neutral-400 mt-1 max-w-[200px] leading-tight line-clamp-2">{profile.bio}</p>
            
            <div className="w-full flex flex-col gap-2 mt-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="p-2.5 rounded-xl border text-left text-[11px] bg-neutral-900/70 border-neutral-800 text-neutral-300"
                >
                  <p className="font-semibold truncate">{link.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 w-full text-[10px] text-neutral-400">
              💬 Direct Inquiries Box
            </div>
          </div>

          <div className="text-[9px] text-neutral-600 mt-2">Live Preview Simulator</div>
        </div>
      </aside>

    </div>
  );
}