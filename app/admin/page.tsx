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
  RefreshCw
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'links' | 'messaging' | 'analytics'>('links');

  // State Profile
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

  // 1. Ambil Links dari Cloudflare D1
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

  // 2. Ambil Messages dari Cloudflare D1
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
    fetchLinks();
    fetchMessages();
  }, []);

  // 3. Tambah Link Baru ke Cloudflare D1
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

  // 4. Hapus Link dari Cloudflare D1
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
              <p className="text-[11px] text-emerald-400 font-medium">Cloudflare Pro Engine</p>
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
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition border border-neutral-700"
          >
            <span>Preview Live Bio-Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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

            {/* Form Tambah Link Baru */}
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

            {/* List Tautan dari D1 */}
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
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingMessages ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                Memuat pesan dari database D1...
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

        {/* TAB 3: ANALYTICS & INSIGHTS */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-white">Global Insights & Traffic</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Audience engagement metrics (US, Europe & Global distribution).
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

      {/* 3. Kolom Kanan: LIVE SIMULATOR */}
      <aside className="hidden xl:flex w-96 bg-neutral-900/40 border-l border-neutral-800 p-8 items-center justify-center shrink-0">
        <div className="w-full max-w-[280px] h-[560px] bg-neutral-950 rounded-[40px] border-4 border-neutral-800 shadow-2xl p-4 flex flex-col items-center relative overflow-hidden ring-1 ring-neutral-700/50">
          <div className="w-20 h-4 bg-neutral-800 rounded-full mb-4 shrink-0" />

          <div className="w-full flex-1 overflow-y-auto no-scrollbar flex flex-col items-center text-center">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md mb-2"
            />
            <h4 className="text-xs font-bold text-white">{profile.name}</h4>
            <p className="text-[10px] text-emerald-400 font-medium">{profile.tagline}</p>
            
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