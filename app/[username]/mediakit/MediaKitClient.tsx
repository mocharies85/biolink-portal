'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Eye, 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  Sparkles, 
  ArrowLeft,
  Share2,
  Check,
  Play,
  X,
  FileDown,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';

interface RateCardItem {
  id: string;
  platform: string;
  deliverable: string;
  price: number;
  description?: string;
  sample_url?: string;
}

interface MediaKitMetrics {
  headline: string;
  about: string;
  contactEmail: string;
  totalFollowers: number;
  monthlyImpressions: number;
  engagementRate: number;
  primaryNiche: string;
  topCountry: string;
}

export default function MediaKitClient({ username: propUsername }: { username?: string } = {}) {
  const [username, setUsername] = useState<string>(() => {
    if (propUsername) return propUsername.toLowerCase();
    if (typeof window !== 'undefined') {
      const pathPart = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathPart && !['admin', 'login', 'register', 'api'].includes(pathPart.toLowerCase())) {
        return pathPart.toLowerCase();
      }
    }
    return '';
  });

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Metrics State
  const [metrics, setMetrics] = useState<MediaKitMetrics>({
    headline: 'Content Creator & Brand Partner',
    about: 'I produce high-retention content and creative digital showcases. Open for sponsored integrations, dedicated reviews, and long-term brand partnerships.',
    contactEmail: '',
    totalFollowers: 50000,
    monthlyImpressions: 250000,
    engagementRate: 4.8,
    primaryNiche: 'Tech & Lifestyle',
    topCountry: 'USA',
  });

  // Rate Cards State
  const [rateCards, setRateCards] = useState<RateCardItem[]>([
    {
      id: '1',
      platform: 'Instagram',
      deliverable: '1x Dedicated Reel Video',
      price: 150,
      description: 'Includes 30 days usage rights, organic promotion, and story swipe-up/link sticker.',
      sample_url: 'https://youtube.com',
    },
    {
      id: '2',
      platform: 'TikTok',
      deliverable: '1x Creative Showcase Video',
      price: 130,
      description: 'High-energy organic storytelling featuring your product with pinned comment.',
      sample_url: 'https://youtube.com',
    },
    {
      id: '3',
      platform: 'Curiolot Bio',
      deliverable: 'Top Spotlight Link Banner (30 Days)',
      price: 50,
      description: 'Guaranteed top placement on bio link hub with animated gold glow & HOT badge.',
    },
  ]);

  // Video Sample Modal State
  const [activeSampleUrl, setActiveSampleUrl] = useState<string | null>(null);

  // Smart Bundle Calculator State (Multi-selection)
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);

  // Brand Deal Form State
  const [companyName, setCompanyName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [campaignScope, setCampaignScope] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [sending, setSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    // Fetch Creator Profile
    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error('Failed to load profile:', err));

    // Fetch Dynamic Media Kit Data from D1
    fetch(`/api/mediakit?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mediakit) {
          setMetrics({
            headline: data.mediakit.headline || 'Content Creator & Brand Partner',
            about: data.mediakit.about || '',
            contactEmail: data.mediakit.contact_email || '',
            totalFollowers: Number(data.mediakit.total_followers) || 0,
            monthlyImpressions: Number(data.mediakit.monthly_impressions) || 0,
            engagementRate: Number(data.mediakit.engagement_rate) || 0,
            primaryNiche: data.mediakit.primary_niche || 'General',
            topCountry: data.mediakit.audience_country || 'USA',
          });

          if (Array.isArray(data.mediakit.rate_cards) && data.mediakit.rate_cards.length > 0) {
            setRateCards(data.mediakit.rate_cards);
          }
        }
      })
      .catch((err) => console.error('Failed to load media kit:', err))
      .finally(() => setLoading(false));
  }, [username]);

  // Toggle Selection in Smart Calculator
  const handleTogglePackage = (id: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculations: Subtotal, 10% Bundle Discount if 2+ selected
  const rawSubtotal = rateCards
    .filter((card) => selectedPackageIds.includes(card.id))
    .reduce((sum, item) => sum + item.price, 0);

  const discountRate = selectedPackageIds.length >= 2 ? 0.10 : 0;
  const discountAmount = Math.round(rawSubtotal * discountRate);
  const finalCalculatedPrice = rawSubtotal - discountAmount;

  // Handle Share Media Kit URL
  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://link.curiolot.com/${username}/mediakit`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Print/Export to PDF Pitch Deck
  const handleExportPDF = () => {
    window.print();
  };

  // Submit Brand Deal Inquiry to Admin Messaging Inbox
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !businessEmail.trim()) return;

    setSending(true);

    // Ambil rincian paket yang dipilih brand
    const selectedPackages = rateCards
      .filter((card) => selectedPackageIds.includes(card.id))
      .map((c) => ({
        id: c.id,
        platform: c.platform,
        deliverable: c.deliverable,
        price: c.price,
      }));

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          brand_name: companyName.trim(),
          contact_name: companyName.trim(),
          contact_email: businessEmail.trim(),
          selected_packages: selectedPackages,
          total_budget: finalCalculatedPrice,
          campaign_brief: campaignScope.trim(),
          target_date: preferredDate || 'Flexible',
        }),
      });

      if (res.ok) {
        setIsSent(true);
        setCompanyName('');
        setBusinessEmail('');
        setCampaignScope('');
        setPreferredDate('');
        setSelectedPackageIds([]);
        setTimeout(() => setIsSent(false), 6000);
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || 'Failed to send campaign inquiry. Please try again.');
      }
    } catch {
      alert('Network error while submitting inquiry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center py-10 px-4 sm:px-6 relative selection:bg-amber-500 selection:text-neutral-950 font-sans">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 left-1/4 w-[350px] h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8">
        
        {/* Navigation & Action Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 print:hidden">
          <a
            href={`/${username}`}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
            <span>Back to Bio Link</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 text-neutral-300 hover:text-amber-300 transition shadow-sm"
              title="Download Media Kit as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition shadow-sm ${
                isCopied
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Share Kit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Creator Hero Banner */}
        <section className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={profile?.avatar || '/default-avatar.svg'}
                alt={profile?.name || username}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
              />
              <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-amber-500 text-neutral-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left truncate">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  @{username}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" /> Verified Creator
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mt-1">
                {metrics.headline}
              </p>

              <p className="text-xs text-neutral-400 leading-relaxed mt-2.5 max-w-lg">
                {metrics.about}
              </p>
            </div>
          </div>
        </section>

        {/* Audience Statistics & Reach */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audience Statistics &amp; Reach</span>
            </h2>
            <span className="text-[10px] font-semibold text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Analytics Validated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1 shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Reach</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white mt-1">
                {metrics.totalFollowers.toLocaleString()}+
              </p>
              <span className="text-[10px] text-neutral-500">Cross Platform</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1 shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Monthly Views</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white mt-1">
                {metrics.monthlyImpressions.toLocaleString()}+
              </p>
              <span className="text-[10px] text-neutral-500">Avg Impressions</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1 shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Engagement</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                {metrics.engagementRate}%
              </p>
              <span className="text-[10px] text-neutral-500">Above Average</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1 shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Top Audience</span>
              </div>
              <p className="text-base sm:text-lg font-black text-white truncate mt-1">
                {metrics.topCountry}
              </p>
              <span className="text-[10px] text-neutral-500 truncate">{metrics.primaryNiche}</span>
            </div>
          </div>
        </section>

        {/* Sponsorship Packages & Rate Cards */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Sponsorship Packages &amp; Deliverables</span>
            </h2>
            <span className="text-[11px] text-neutral-400">
              Select packages to auto-calculate bundle
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {rateCards.map((item) => {
              const isSelected = selectedPackageIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleTogglePackage(item.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer relative shadow-sm ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/15 via-neutral-900 to-neutral-900 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                        {item.platform}
                      </span>
                      <span className="text-base font-black text-amber-400">
                        ${item.price}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white leading-snug">
                      {item.deliverable}
                    </h3>

                    {item.description && (
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-1.5 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                    {item.sample_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSampleUrl(item.sample_url!);
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-current" />
                        <span>Watch Work Sample</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Package Selected</span>
                        </>
                      ) : (
                        <span>Select Package</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Smart Campaign Bundle Calculator Card */}
        {selectedPackageIds.length > 0 && (
          <section className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Smart Bundle Summary ({selectedPackageIds.length} Packages)</span>
                  {discountRate > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5" /> 10% Bundle Discount
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Package total auto-applied directly to your campaign inquiry below.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              {discountRate > 0 && (
                <span className="text-xs text-neutral-500 line-through mr-2">
                  ${rawSubtotal}
                </span>
              )}
              <span className="text-2xl font-black text-amber-400">
                ${finalCalculatedPrice}
              </span>
            </div>
          </section>
        )}

        {/* Brand Deal / Sponsorship Inquiry Submission */}
        <section className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl flex flex-col gap-5 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                Submit Brand Deal &amp; Lock Date
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Interested in collaborating with @{username}? Send your campaign brief directly to the creator's inbox.
            </p>
          </div>

          {isSent ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <h4 className="text-sm font-bold text-emerald-300">Campaign Brief Sent Successfully!</h4>
              <p className="text-xs text-neutral-400 max-w-sm">
                @{username} has received your collaboration proposal in their verified inbox and will get back to your business email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Studio"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Business Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="partnership@brand.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Target Launch / Preferred Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Campaign Brief &amp; Scope</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline your campaign objective, product links, key messaging requirements, or timeline..."
                  value={campaignScope}
                  onChange={(e) => setCampaignScope(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {sending ? (
                  <span>Submitting Campaign...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedPackageIds.length > 0
                        ? `Submit Campaign Inquiry ($${finalCalculatedPrice})`
                        : 'Submit Campaign Inquiry'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-neutral-600 pb-6 print:hidden">
          <p className="text-[11px]">
            Powered by <strong>Curiolot Creator Media Kit</strong>
          </p>
        </footer>

      </div>

      {/* Video Sample Modal */}
      {activeSampleUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                Previous Campaign Sample
              </span>
              <button
                type="button"
                onClick={() => setActiveSampleUrl(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src={activeSampleUrl.replace('watch?v=', 'embed/')}
                title="Sample Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveSampleUrl(null)}
              className="w-full py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </main>
  );
}