'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Send, 
  MessageSquare, 
  ExternalLink, 
  Heart, 
  Sparkles, 
  CheckCircle2,
  Share2
} from 'lucide-react';

interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  desc?: string;
  is_active?: number | boolean;
  active?: boolean;
  is_highlighted?: number | boolean;
  highlight?: boolean;
}

export default function UserBioClient() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername || 'creator';

  const [profile, setProfile] = useState({
    name: username.toUpperCase(),
    tagline: "Digital Creator & Independent Maker",
    bio: `Welcome to the official hub of @${username}. Explore featured portfolios, stores, and collaborative projects below.`,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Ambil profil dan tautan spesifik sesuai username di URL
  useEffect(() => {
    // 1. Ambil data profil
    fetch(`/api/profile?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error('Failed to load profile:', err));

    // 2. Ambil tautan milik user tersebut
    fetch(`/api/links?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.links) setLinks(data.links);
      })
      .catch((err) => console.error('Failed to load links:', err))
      .finally(() => setLoadingLinks(false));
  }, [username]);

  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          sender: senderName.trim() || 'Anonymous',
          content: message.trim(),
        }),
      });

      if (res.ok) {
        setIsSent(true);
        setSenderName('');
        setMessage('');
        setTimeout(() => setIsSent(false), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      alert('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Share Button */}
        <div className="w-full flex justify-end mb-3">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: profile.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            }}
            aria-label="Share profile"
            className="p-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition text-neutral-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500 shadow-xl shadow-emerald-500/10">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-neutral-950 p-1 rounded-full text-xs shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            {profile.name}
          </h1>
          <p className="text-xs font-semibold text-emerald-400 mt-1 tracking-wider uppercase">
            @{username} • {profile.tagline}
          </p>
          <p className="text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
            {profile.bio}
          </p>
        </header>

        {/* Links List */}
        <section className="w-full flex flex-col gap-3.5 mb-8">
          {loadingLinks ? (
            <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
              Loading links...
            </div>
          ) : (
            links
              .filter((link) => link.is_active === 1 || link.is_active === undefined || link.active)
              .map((link) => {
                const isHighlight = Boolean(link.is_highlighted || link.highlight);
                const descText = link.description || link.desc;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:scale-[1.015] active:scale-[0.99] ${
                      isHighlight
                        ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/20'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-neutral-100 group-hover:text-white flex items-center gap-1.5">
                        {link.title}
                        {isHighlight && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </span>
                      {descText && (
                        <span className="text-xs text-neutral-400 mt-0.5">{descText}</span>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5 ml-3 shrink-0" />
                  </a>
                );
              })
          )}
        </section>

        {/* Direct Messaging Section */}
        <section className="w-full p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm mb-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Direct Inquiry to @{username}</h2>
          </div>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Have a project collaboration, freelance inquiry, or message? Send a note directly to this inbox.
          </p>

          {isSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-300">Message Delivered!</p>
              <p className="text-[11px] text-neutral-400">Thank you for reaching out. The creator will receive your note shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col gap-2.5">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Name or Email (Optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Branding Footer */}
        <footer className="flex flex-col items-center gap-1 text-center text-xs text-neutral-500">
          <p className="flex items-center gap-1 text-[11px]">
            Powered by <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> Curiolot Link
          </p>
        </footer>

      </div>
    </main>
  );
}