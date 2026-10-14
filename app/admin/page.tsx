'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Link2,
  MessageSquare,
  BarChart3,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  Lock,
  TrendingUp,
  Smartphone,
  Globe,
  X,
  HelpCircle,
  MessageCircle,
  LogOut,
  Camera,
  Upload,
  Radio,
  Clock,
  Image as ImageIcon,
  Music,
  Link as LinkIcon
} from 'lucide-react';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  clicks?: number;
  is_active?: number;
}

interface MessageItem {
  id: number;
  sender_name?: string;
  name?: string;
  email?: string;
  message: string;
  created_at: number;
}

interface StoryItem {
  id: string;
  media_url: string;
  caption?: string;
  audio_url?: string;
  link_url?: string;
  created_at: string;
}

interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
}

interface CurrentUser {
  username: string;
  email: string;
  role?: string;
  is_pro?: number;
}

// Helper: Kompresi Gambar Otomatis Menggunakan Canvas API
const compressImage = (file: File, maxWidth = 1080, maxHeight = 1920, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  // User session
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'stories' | 'inbox' | 'analytics'>('profile');

  // Profile states
  const [profile, setProfile] = useState<ProfileData>({
    name: 'New Creator',
    tagline: 'Digital Creator',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Links states
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  // Stories states
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyAudioUrl, setStoryAudioUrl] = useState('');
  const [storyLinkUrl, setStoryLinkUrl] = useState('');
  const [postingStory, setPostingStory] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const [compressingStory, setCompressingStory] = useState(false);

  // Modals states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);

  // Inbox states
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Contact Admin modal states
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  // Derived variables
  const activeUsername = currentUser?.username || 'creator';
  const isProUser = currentUser?.is_pro === 1;
  const viewsCount = 1240;
  const clicksCount = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  // Check auth session
  useEffect(() => {
    const storedUser = sessionStorage.getItem('curiolot_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Load profile data
  const fetchProfile = async () => {
    if (!activeUsername) return;
    try {
      const res = await fetch(`/api/profile?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            name: data.profile.name || activeUsername,
            tagline: data.profile.tagline || 'Digital Creator',
            bio: data.profile.bio || '',
            avatar: data.profile.avatar || profile.avatar,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // Load links data
  const fetchLinks = async () => {
    if (!activeUsername) return;
    setLoadingLinks(true);
    try {
      const res = await fetch(`/api/links?username=${activeUsername}`);
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

  // Load inbox messages
  const fetchMessages = async () => {
    if (!activeUsername) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?username=${activeUsername}`);
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

  // Load active stories
  const fetchStories = async () => {
    if (!activeUsername) return;
    setLoadingStories(true);
    try {
      const res = await fetch(`/api/stories?username=${activeUsername}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchLinks();
      fetchMessages();
      fetchStories();
    }
  }, [currentUser]);

  // Upload Foto Profil dengan kompresi otomatis (400x400)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setProfile((prev) => ({ ...prev, avatar: compressed }));
      } catch (err) {
        console.error('Error compressing avatar:', err);
        alert('Gagal memproses gambar profil.');
      }
    }
  };

  // Upload Foto Story dengan kompresi otomatis (1080x1920)
  const handleStoryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingStory(true);
    try {
      const compressed = await compressImage(file, 1080, 1920, 0.75);
      setStoryMediaUrl(compressed);
    } catch (err) {
      console.error('Error compressing story image:', err);
      alert('Gagal memproses gambar story. Gunakan file JPG/PNG.');
    } finally {
      setCompressingStory(false);
      e.target.value = '';
    }
  };

  // Save profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          ...profile,
        }),
      });

      if (res.ok) {
        setProfileSavedSuccess(true);
        setTimeout(() => setProfileSavedSuccess(false), 3000);
      } else {
        alert('Failed to save profile settings.');
      }
    } catch {
      alert('Network error while saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Add new link handler
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    if (!isProUser && links.length >= 3) {
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
          url: newUrl.trim(),
          description: newDesc.trim(),
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setNewDesc('');
        fetchLinks();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add link.');
      }
    } catch {
      alert('Network error while adding link.');
    } finally {
      setAddingLink(false);
    }
  };

  // Create new story handler
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaUrl.trim()) {
      alert('Pilih gambar atau masukkan tautan gambar terlebih dahulu.');
      return;
    }

    setPostingStory(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          media_url: storyMediaUrl,
          caption: storyCaption.trim(),
          audio_url: storyAudioUrl.trim() || null,
          link_url: storyLinkUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setStorySuccess(true);
        setStoryMediaUrl('');
        setStoryCaption('');
        setStoryAudioUrl('');
        setStoryLinkUrl('');
        fetchStories();
        setTimeout(() => setStorySuccess(false), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal mempublikasikan story.');
      }
    } catch {
      alert('Terjadi gangguan jaringan saat memposting story.');
    } finally {
      setPostingStory(false);
    }
  };

  // Delete link handler
  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to remove this link?')) return;

    try {
      const res = await fetch(`/api/links?id=${id}&username=${activeUsername}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== id));
      } else {
        alert('Failed to delete link.');
      }
    } catch {
      alert('Network error while deleting link.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('curiolot_auth_user');
    router.push('/login');
  };

  // Send support message handler
  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSendingSupport(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          email: currentUser?.email || '',
          message: supportMessage.trim(),
        }),
      });

      if (res.ok) {
        setSupportSentSuccess(true);
        setSupportMessage('');
        setTimeout(() => {
          setSupportSentSuccess(false);
          setShowSupportModal(false);
        }, 1800);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch {
      alert('Network error. Failed to reach support server.');
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* User Account Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain shrink-0" 
            />
            <div className="truncate">
              <p className="font-bold text-sm text-white truncate">@{activeUsername}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isProUser ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-[11px] text-neutral-400 font-medium">
                  {isProUser ? 'PRO Creator' : 'Free Creator'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile &amp; Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'links'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4" />
                <span>Links &amp; Content</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px]">
                {links.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'stories'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>24h Stories</span>
              </div>
              {stories.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {stories.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'inbox'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Messaging &amp; Inbox</span>
              </div>
              {messages.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Global Insights</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="flex flex-col gap-2 pt-6 border-t border-neutral-800 mt-6">
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-emerald-500/40 flex items-center justify-center gap-2 transition"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Need Help? Contact Admin</span>
          </button>

          <a
            href={`/${activeUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-xs font-semibold text-rose-400 flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* TAB 1: Profile & Bio */}
        {activeTab === 'profile' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Profile &amp; Bio</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Customize how your bio hub appears to your visitors.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-2">Profile Avatar</label>
                  <div className="flex items-center gap-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="relative group">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/40 shadow-lg group-hover:opacity-80 transition"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                        title="Upload new avatar"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <p className="text-xs font-bold text-white">Upload New Image</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Foto otomatis dikompresi ringan &amp; responsif.
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Choose File</span>
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

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

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Tagline / Role</label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

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
              </div>

              <div className="flex items-center justify-between">
                {profileSavedSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Links & Content */}
        {activeTab === 'links' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-white">Links &amp; Content</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage your external links, portfolios, and stores.
                </p>
              </div>
              {!isProUser && (
                <div className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2 shrink-0">
                  <span>Free Limit: {links.length}/3 Links</span>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="underline font-bold hover:text-amber-300"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Form Add Link */}
            <form onSubmit={handleAddLink} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Link</h3>
              
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

              <div>
                <input
                  type="text"
                  placeholder="Description or subtitle (optional, e.g. Free tools for digital creators)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={addingLink}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>{addingLink ? 'Adding...' : 'Add Link to Bio'}</span>
              </button>
            </form>

            {/* List of Links */}
            <div className="flex flex-col gap-2.5">
              {loadingLinks ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Loading links...</p>
              ) : links.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <Link2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No links added yet. Create your first link above.</p>
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 hover:border-neutral-700 transition"
                  >
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-white truncate">{link.title}</p>
                      {link.description && (
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{link.description}</p>
                      )}
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 block">{link.clicks || 0}</span>
                        <span className="text-[10px] text-neutral-500">clicks</span>
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 24h Stories (Dengan Gambar Kompresi, Audio Musik & Link CTA) */}
        {activeTab === 'stories' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>24h Profile Stories</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Status
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Post visual updates with background music and clickable links that automatically expire after 24 hours.
              </p>
            </div>

            {/* Form Buat Story Baru */}
            <form onSubmit={handleCreateStory} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Publish New Story</span>
              </h3>

              {/* Upload Image Widget */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                  {storyMediaUrl ? (
                    <img src={storyMediaUrl} alt="Story preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-neutral-600" />
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1 w-full text-center sm:text-left">
                  <p className="text-xs font-bold text-white">Story Photo / Poster</p>
                  <p className="text-[11px] text-neutral-400">
                    Pilih foto dari galeri (otomatis dikompresi) atau tempel URL gambar di bawah.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <button
                      type="button"
                      disabled={compressingStory}
                      onClick={() => storyFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{compressingStory ? 'Compressing Image...' : 'Upload from Device'}</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={storyFileInputRef}
                    accept="image/*"
                    onChange={handleStoryPhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Direct Image URL fallback */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Or paste direct image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={storyMediaUrl.startsWith('data:') ? '' : storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
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

              {/* Clickable CTA Link */}
              <div>
                <label className="text-[11px] text-neutral-300 font-semibold block mb-1 flex items-center gap-1.5">
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
                <p className="text-[10px] text-neutral-500 mt-1">
                  Akan muncul sebagai stiker tombol tautan elegan yang bisa langsung diklik oleh pengunjung story.
                </p>
              </div>

              {/* Background Music / Audio */}
              <div>
                <label className="text-[11px] text-neutral-300 font-semibold block mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Background Music URL (Optional MP3/WAV)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/audio/sample.mp3"
                  value={storyAudioUrl}
                  onChange={(e) => setStoryAudioUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Musik akan otomatis diputar saat pengunjung membuka story (dengan tombol mute/unmute).
                </p>
              </div>

              {storySuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Story published successfully! Active for 24 hours.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={postingStory || !storyMediaUrl || compressingStory}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1 shadow-md shadow-emerald-500/20"
              >
                <Radio className="w-4 h-4" />
                <span>{postingStory ? 'Publishing Story...' : 'Publish 24h Story'}</span>
              </button>
            </form>

            {/* List Active Stories */}
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
                  <p className="text-[11px] text-neutral-500 mt-1">
                    When you publish a story, your bio avatar will show an animated ring!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stories.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex gap-3 items-center"
                    >
                      <img
                        src={st.media_url}
                        alt="Story thumb"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-700"
                      />
                      <div className="truncate flex-1">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active Now
                        </span>
                        <p className="text-xs text-neutral-200 truncate mt-0.5">
                          {st.caption || 'No caption'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {st.link_url && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 truncate max-w-[100px]">
                              <LinkIcon className="w-2.5 h-2.5 shrink-0" /> Link
                            </span>
                          )}
                          {st.audio_url && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <Music className="w-2.5 h-2.5 shrink-0" /> Music
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Messaging & Inbox */}
        {activeTab === 'inbox' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Audience Messages</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Read direct inquiries and messages submitted by your audience.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {loadingMessages ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Your inbox is empty. No messages received yet.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">
                        {msg.name || msg.sender_name || 'Anonymous Visitor'}
                      </p>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {msg.email && (
                      <p className="text-[11px] text-neutral-400">{msg.email}</p>
                    )}
                    <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-850 mt-1">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Audience & Global Insights */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Audience Insights</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Profile and link performance for @{activeUsername}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Total Views</span>
                <span className="text-2xl font-bold text-white block mt-2">{viewsCount.toLocaleString()}</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Link Clicks</span>
                <span className="text-2xl font-bold text-white block mt-2">
                  {clicksCount}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400">Account Type</span>
                <span
                  className={`text-xl font-bold block mt-2 ${
                    isProUser ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isProUser ? 'PRO Tier' : 'Free Tier'}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Detailed Link Analytics</h3>
                    {!isProUser && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PRO ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Analyze individual link CTR, device breakdown, and audience referral sources.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isProUser) {
                    setShowDetailedInsights(true);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                  isProUser
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isProUser ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Open Analytics Dashboard</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Pro Insights</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Live Phone Preview Simulator */}
      <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
        <div className="w-full max-w-[280px] h-[560px] bg-neutral-950 border-[6px] border-neutral-800 rounded-[40px] shadow-2xl p-4 flex flex-col items-center relative overflow-hidden">
          <div className="w-20 h-4 bg-neutral-800 rounded-full mb-6 shrink-0" />
          
          <div className="w-full flex-1 overflow-y-auto flex flex-col items-center">
            {/* Avatar dengan Indikator Story di Simulator */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className={`w-16 h-16 rounded-full object-cover mb-3 shrink-0 shadow-lg transition ${
                  stories.length > 0 
                    ? 'border-2 border-emerald-400 ring-2 ring-emerald-400/50' 
                    : 'border-2 border-emerald-500/40'
                }`}
              />
              {stories.length > 0 && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-neutral-950 px-1.5 py-0.2 rounded-full text-[7px] font-black uppercase tracking-wider">
                  Story
                </span>
              )}
            </div>

            <h4 className="text-xs font-bold text-white text-center">{profile.name}</h4>
            <p className="text-[10px] text-emerald-400 font-medium text-center">{profile.tagline}</p>
            {profile.bio && (
              <p className="text-[10px] text-neutral-400 text-center mt-1 px-2 line-clamp-2">{profile.bio}</p>
            )}

            <div className="w-full flex flex-col gap-2 mt-4">
              {links.map((l) => (
                <div
                  key={l.id}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-200 text-center truncate shadow-sm"
                >
                  <span className="font-semibold block truncate">{l.title}</span>
                  {l.description && (
                    <span className="text-[8px] text-neutral-400 block truncate mt-0.5">{l.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-neutral-600 mt-2 shrink-0">Live Preview (@{activeUsername})</p>
        </div>
      </aside>

      {/* Modal: Ko-fi Upgrade to PRO */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold text-xl mx-auto shadow-lg shadow-amber-500/20">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-white mt-4">Upgrade to Curiolot Link PRO</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Unlock full platform capabilities and grow your audience without limits.
              </p>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2.5 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Unlimited links</strong> (bypass 3-link free limit)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Exclusive verified <strong>PRO badge</strong> on your bio page</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Advanced visitor analytics &amp; instant inbox messaging</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-neutral-300 leading-relaxed mb-6">
              💡 <strong>Instant Activation:</strong> When paying on Ko-fi, please keep your account email (<strong>{currentUser?.email}</strong>) or write <strong>@{activeUsername}</strong> in the message box. Your account unlocks automatically!
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Cancel
              </button>
              <a
                href="https://ko-fi.com/cycrack"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowUpgradeModal(false)}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <span>Upgrade on Ko-fi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: PRO Detailed Analytics Dashboard */}
      {showDetailedInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Pro Performance Dashboard
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      PRO Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Real-time engagement breakdown for @{activeUsername}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedInsights(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Average CTR</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-1">
                  {viewsCount > 0 ? ((clicksCount / viewsCount) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Total Active Links</span>
                <p className="text-lg font-extrabold text-white mt-1">{links.length} Links</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Audience Retention</span>
                <p className="text-lg font-extrabold text-amber-400 mt-1">High (Top 10%)</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-neutral-300 mb-2.5">Individual Link Performance</h4>
              <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
                <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400">
                  <div className="col-span-7">Link Title &amp; URL</div>
                  <div className="col-span-3 text-right">Clicks</div>
                  <div className="col-span-2 text-right">CTR</div>
                </div>
                <div className="divide-y divide-neutral-800">
                  {links.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">No links added yet.</div>
                  ) : (
                    links.map((link) => {
                      const linkClicks = link.clicks || 0;
                      const linkCtr = viewsCount > 0 ? ((linkClicks / viewsCount) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={link.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-neutral-900/30 transition">
                          <div className="col-span-7 truncate pr-2">
                            <p className="font-medium text-white truncate">{link.title}</p>
                            {link.description && (
                              <p className="text-[11px] text-neutral-400 truncate">{link.description}</p>
                            )}
                            <p className="text-[10px] text-neutral-500 truncate">{link.url}</p>
                          </div>
                          <div className="col-span-3 text-right font-bold text-neutral-200">
                            {linkClicks} clicks
                          </div>
                          <div className="col-span-2 text-right font-bold text-emerald-400">
                            {linkCtr}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-neutral-400" /> Devices Breakdown
                </h5>
                <div className="flex flex-col gap-2.5 text-[11px]">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>Mobile (iOS &amp; Android)</span>
                    <span className="font-bold text-white">84%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
                  </div>
                  <div className="flex justify-between items-center text-neutral-300 mt-1">
                    <span>Desktop &amp; Tablets</span>
                    <span className="font-bold text-white">16%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '16%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neutral-400" /> Top Referrers
                </h5>
                <div className="flex flex-col gap-2 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Instagram Bio</span>
                    <span className="font-semibold text-white">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">TikTok Profile</span>
                    <span className="font-semibold text-white">32%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Twitter / X</span>
                    <span className="font-semibold text-white">14%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Direct / Other</span>
                    <span className="font-semibold text-white">9%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailedInsights(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Contact Admin Support Dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Contact Admin Support</h3>
                  <p className="text-[11px] text-neutral-400">Ask questions regarding PRO features or assistance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportSentSuccess ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  ✓
                </div>
                <p className="text-sm font-bold text-white">Message Sent Successfully!</p>
                <p className="text-xs text-neutral-400 mt-1">Our team will review your inquiry and reply via email.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Your Question or Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Have questions about subscription upgrades, custom features, or account settings? Write here..."
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingSupport || !supportMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition disabled:opacity-50"
                  >
                    {sendingSupport ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}