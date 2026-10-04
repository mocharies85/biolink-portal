'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Send, 
  MessageSquare, 
  ExternalLink, 
  Heart, 
  Sparkles, 
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function BioLinkPage() {
  // Public profile details (US/Global market standard)
  const profile = {
    name: "Aries Creative Lab",
    tagline: "Digital Creator & Independent Developer",
    bio: "Crafting vector illustrations, interactive web experiences, and digital publications.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
  };

  // Curated links tailored for global audience & monetization
  const links = [
    {
      id: 1,
      title: "Stock Vector & Illustration Portfolio",
      desc: "High-resolution commercial vectors & graphic assets",
      url: "https://stock.adobe.com",
      highlight: true,
      badge: "Featured",
    },
    {
      id: 2,
      title: "Interactive Web Tools & Experiments",
      desc: "Free client-side utilities and browser mini-apps",
      url: "https://github.com",
      highlight: false,
    },
    {
      id: 3,
      title: "Books & Published Works",
      desc: "Fiction and creative guides on Amazon Kindle",
      url: "https://amazon.com",
      highlight: false,
    },
    {
      id: 4,
      title: "Support My Work (Buy Me a Coffee)",
      desc: "Fuel open-source tools and ongoing creative projects",
      url: "https://ko-fi.com",
      highlight: false,
      badge: "Support",
    },
  ];

  // Messaging state (Interactive inbox for inbound inquiries)
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    // Simulating message transmission (will connect to Cloudflare D1 next)
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      setSenderName('');
      setMessage('');
      setTimeout(() => setIsSent(false), 5000);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Top bar: Share Button */}
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
          <p className="text-xs font-semibold text-emerald-400 mt-1 uppercase tracking-wider">
            {profile.tagline}
          </p>
          <p className="text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
            {profile.bio}
          </p>
        </header>

        {/* Links Section */}
        <section className="w-full flex flex-col gap-3.5 mb-8">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:scale-[1.015] active:scale-[0.99] ${
                link.highlight
                  ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/20'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-neutral-100 group-hover:text-white flex items-center gap-1.5">
                  {link.title}
                  {link.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      {link.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">{link.desc}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition-transform group-hover:translate-x-0.5 ml-3 shrink-0" />
            </a>
          ))}
        </section>

        {/* Direct Messaging Form (Inbox Feature) */}
        <section className="w-full p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm mb-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Direct Inquiry & Inquiries</h2>
          </div>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Have a collaboration idea, freelance inquiry, or just want to connect? Send a note directly to my dashboard inbox.
          </p>

          {isSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-300">Message Delivered!</p>
              <p className="text-[11px] text-neutral-400">Thank you for reaching out. I’ll get back to you shortly.</p>
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
                placeholder="Type your message here..."
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
                    <span>Send to Inbox</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-1 text-center text-xs text-neutral-500">
          <p className="flex items-center gap-1">
            Independently built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
          <a href="/admin" className="text-[11px] text-neutral-400 hover:text-emerald-400 underline underline-offset-2 transition mt-1">
            Open Admin Dashboard →
          </a>
        </footer>

      </div>
    </main>
  );
}