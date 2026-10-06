'use client';

import React, { useState, useEffect } from 'react';
import { 
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
  ArrowRight
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

// ==========================================
// PIN RAHASIA ADMIN (Silakan ganti sesuai keinginan)
// ==========================================
const ADMIN_SECRET_PIN = "240685"; 

export default function AdminDashboard() {
  // State Autentikasi / Kunci
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Cek apakah sudah pernah login di sesi ini
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
      setPinError('PIN salah! Akses ditolak.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('biolink_admin_authenticated');
    setIsAuthenticated(false);
    setPinInput('');
  };

  // State Halaman Admin
  const [activeTab, setActiveTab] = useState<'links' | 'messaging' | 'analytics'>('links');

  const profile = {
    name: "Aries Creative Lab",
    tagline: "Digital Creator & Independent Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
  };

  // State Links dari D1
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Form input link baru
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  // State Messages dari D1
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error('Gagal mengambil links:', err);
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
      console.error('Gagal mengambil pesan:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
      fetchMessages();
    }
  }, [isAuthenticated]);

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
        alert(errData.error || 'Gagal menambahkan link');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Yakin ingin menghapus link ini?')) return;

    try {
      const res = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert('Gagal menghapus link dari database.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = messages.filter((m) => (m.is_read ?? 0) === 0).length;

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  // ==========================================
  // TAMPILAN LOCK SCREEN (JIKA BELUM LOGIN)
  // ==========================================
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
            Halaman ini diproteksi. Masukkan PIN keamanan untuk mengakses inbox & database.
          </p>

          <form onSubmit={handleLogin} className="w-full mt-6 flex flex-col gap-3">
            <div className="relative">
              <input
                type="password"
                placeholder="Masukkan PIN Admin..."
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
              <p className="text-xs text-rose-400 font-medium animate-shake">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 mt-6 transition underline underline-offset-4"
          >
            ← Kembali ke Halaman Bio-Link
          </a>
        </div>
      </main>
    );
  }

  // ==========================================
  // TAMPILAN UTAMA ADMIN (SETELAH BERHASIL LOGIN)
  // ==========================================
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
              <h2 className="text-sm font-bold text-white tracking-tight">BioPortal Studio</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Protected Admin</span>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5">
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
                Links & Content
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
                Messaging & Inbox
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
            <span>Preview Live Bio-Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition border border-rose-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci & Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Panel Utama */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
        
        {/* TAB 1: LINKS MANAGEMENT */}
        {activeTab === 'links' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Links & Monetization</h1>
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
                Memuat tautan dari Cloudflare D1...
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

        {/* TAB 2: MESSAGING / INBOX */}
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
                <