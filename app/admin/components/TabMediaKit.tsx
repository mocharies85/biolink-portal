'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  Video,
  Lock,
  Sparkles,
  ArrowRight,
  Pencil,
  Check,
  X,
  Palette,
} from 'lucide-react';

export type MediaKitTheme = 'onyx' | 'sand' | 'studio' | 'violet';

export interface RateCardItem {
  id: string;
  platform: string;
  deliverable: string;
  price: number;
  description?: string;
  sample_url?: string;
}

export interface MediaKitData {
  is_enabled: boolean;
  headline: string;
  about: string;
  contact_email: string;
  total_followers: number;
  monthly_impressions: number;
  engagement_rate: number;
  primary_niche: string;
  audience_country: string;
  rate_cards: RateCardItem[];
  theme?: MediaKitTheme;
}

interface TabMediaKitProps {
  activeUsername: string;
  mediaKit: MediaKitData;
  setMediaKit: React.Dispatch<React.SetStateAction<MediaKitData>>;
  isPro?: boolean;
}

const THEME_SELECTION_OPTIONS: {
  id: MediaKitTheme;
  name: string;
  description: string;
  bgPreview: string;
  borderPreview: string;
  textPreview: string;
}[] = [
  {
    id: 'onyx',
    name: 'Onyx Noir',
    description: 'Dark tech & luxury contrast',
    bgPreview: 'bg-[#0a0a0c]',
    borderPreview: 'border-emerald-500/40',
    textPreview: 'text-emerald-400',
  },
  {
    id: 'sand',
    name: 'Warm Sand',
    description: 'Editorial beige & warm aesthetic',
    bgPreview: 'bg-[#f5f1eb]',
    borderPreview: 'border-[#99623b]/40',
    textPreview: 'text-[#99623b]',
  },
  {
    id: 'studio',
    name: 'Clean Studio',
    description: 'Minimalist high-contrast light',
    bgPreview: 'bg-white',
    borderPreview: 'border-neutral-300',
    textPreview: 'text-neutral-900',
  },
  {
    id: 'violet',
    name: 'Cyber Violet',
    description: 'Neon pulse & entertainment vibe',
    bgPreview: 'bg-[#0d0716]',
    borderPreview: 'border-purple-500/40',
    textPreview: 'text-fuchsia-400',
  },
];

export default function TabMediaKit({
  activeUsername,
  mediaKit,
  setMediaKit,
  isPro = false,
}: TabMediaKitProps) {
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State: Add New Package
  const [newPlatform, setNewPlatform] = useState('Instagram');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newDesc, setNewDesc] = useState('');
  const [newSampleUrl, setNewSampleUrl] = useState('');

  // Form State: Active Package Being Edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState('Instagram');
  const [editDeliverable, setEditDeliverable] = useState('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editDesc, setEditDesc] = useState('');
  const [editSampleUrl, setEditSampleUrl] = useState('');

  const targetUsername = activeUsername || 'creator';
  const packageCount = mediaKit.rate_cards?.length || 0;

  // Auto-synchronization: turn OFF if package count drops to 0
  useEffect(() => {
    if (packageCount === 0 && mediaKit.is_enabled) {
      setMediaKit((prev) => ({ ...prev, is_enabled: false }));
    }
  }, [packageCount, mediaKit.is_enabled, setMediaKit]);

  // Lock Screen Paywall for Free Tier Users
  if (!isPro) {
    return (
      <div className="max-w-2xl p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 text-center flex flex-col items-center gap-5 shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <Lock className="w-7 h-7" />
        </div>

        <div className="max-w-md">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            PRO Feature Exclusive
          </span>
          <h2 className="text-xl font-black text-white mt-2">
            Unlock Creator Media Kit
          </h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Publish interactive rate cards, showcase verified audience reach, and receive paid brand sponsorships directly to your dashboard inbox with 0% platform commissions.
          </p>
        </div>

        <div className="w-full max-w-sm p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 text-left flex flex-col gap-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Custom Visual Themes (Onyx, Sand, Studio, Violet)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Interactive Rate Cards &amp; Deliverables</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Verified Reach &amp; Engagement Demographics</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Direct Brand Deal Inbox Access</span>
          </div>
        </div>

        <a
          href="/pricing"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
        >
          <span>Upgrade to PRO ($5/mo)</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // Add New Package (automatically turn ON if adding first package)
  const handleAddPackage = () => {
    if (!newDeliverable.trim() || newPrice === '') return;

    const newItem: RateCardItem = {
      id: Date.now().toString(),
      platform: newPlatform,
      deliverable: newDeliverable.trim(),
      price: Number(newPrice),
      description: newDesc.trim() || undefined,
      sample_url: newSampleUrl.trim() || undefined,
    };

    setMediaKit((prev) => {
      const updatedRateCards = [...(prev.rate_cards || []), newItem];
      return {
        ...prev,
        rate_cards: updatedRateCards,
        is_enabled: prev.rate_cards?.length === 0 ? true : prev.is_enabled,
      };
    });

    setNewDeliverable('');
    setNewPrice('');
    setNewDesc('');
    setNewSampleUrl('');
  };

  // Open Edit Form for Specific Package
  const handleStartEdit = (item: RateCardItem) => {
    setEditingId(item.id);
    setEditPlatform(item.platform);
    setEditDeliverable(item.deliverable);
    setEditPrice(item.price);
    setEditDesc(item.description || '');
    setEditSampleUrl(item.sample_url || '');
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Update Package
  const handleUpdatePackage = (id: string) => {
    if (!editDeliverable.trim() || editPrice === '') return;

    setMediaKit((prev) => ({
      ...prev,
      rate_cards: (prev.rate_cards || []).map((item) =>
        item.id === id
          ? {
              ...item,
              platform: editPlatform,
              deliverable: editDeliverable.trim(),
              price: Number(editPrice),
              description: editDesc.trim() || undefined,
              sample_url: editSampleUrl.trim() || undefined,
            }
          : item
      ),
    }));

    setEditingId(null);
  };

  // Delete Package (automatically turn OFF if all packages deleted)
  const handleDeletePackage = (id: string) => {
    setMediaKit((prev) => {
      const updatedRateCards = (prev.rate_cards || []).filter((item) => item.id !== id);
      return {
        ...prev,
        rate_cards: updatedRateCards,
        is_enabled: updatedRateCards.length === 0 ? false : prev.is_enabled,
      };
    });
    if (editingId === id) setEditingId(null);
  };

  // Manual Toggle Switch
  const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (packageCount === 0) return;
    setMediaKit((prev) => ({
      ...prev,
      is_enabled: e.target.checked,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const isCurrentlyEnabled = packageCount > 0 && mediaKit.is_enabled;

    const payload = {
      ...mediaKit,
      theme: mediaKit.theme || 'onyx',
      is_enabled: isCurrentlyEnabled,
    };

    try {
      const res = await fetch('/api/mediakit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          mediaKitData: payload,
          ...payload,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data?.error || `Error (${res.status}): Failed to save media kit.`);
      }
    } catch (err: any) {
      alert(`Network error: ${err?.message || 'Check server connection'}`);
    } finally {
      setSaving(false);
    }
  };

  const isSwitchOn = Boolean(mediaKit.is_enabled && packageCount > 0);

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Creator Media Kit</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              PRO Feature
            </span>
          </h1>

          {isSwitchOn && (
            <a
              href={`/${targetUsername}/mediakit`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <span>View Public Media Kit</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </a>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Showcase your audience statistics, reach, and sponsorship pricing packages to close more brand partnerships.
        </p>
      </div>

      {/* 1. Visual Theme Selection */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Visual Theme Styling</span>
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Choose the visual presentation style displayed to brands when visiting your public Media Kit.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
          {THEME_SELECTION_OPTIONS.map((thm) => {
            const isSelected = (mediaKit.theme || 'onyx') === thm.id;
            return (
              <button
                key={thm.id}
                type="button"
                onClick={() => setMediaKit((prev) => ({ ...prev, theme: thm.id }))}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-2 relative ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-neutral-850'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className={`w-full h-8 rounded-lg border ${thm.borderPreview} ${thm.bgPreview} flex items-center justify-center shadow-inner`}>
                  <span className={`text-[10px] font-black ${thm.textPreview}`}>Aa</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white block">{thm.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400 block mt-0.5 leading-snug">{thm.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Media Kit Headline & Pitch Intro */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span>Headline &amp; Brand Pitch Intro</span>
        </h3>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Headline / Creator Title</label>
          <input
            type="text"
            value={mediaKit.headline || ''}
            onChange={(e) => setMediaKit({ ...mediaKit, headline: e.target.value })}
            placeholder="e.g. Content Creator &amp; Brand Partner"
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/50 transition font-bold"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">About / Creator Pitch Bio</label>
          <textarea
            rows={3}
            value={mediaKit.about || ''}
            onChange={(e) => setMediaKit({ ...mediaKit, about: e.target.value })}
            placeholder="Describe what content you produce and how you collaborate with brands..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Business Contact Email (For Sponsorship Inquiries)</label>
          <input
            type="email"
            value={mediaKit.contact_email || ''}
            onChange={(e) => setMediaKit({ ...mediaKit, contact_email: e.target.value })}
            placeholder="e.g. partnership@curiolot.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
      </div>

      {/* 3. Audience & Reach Metrics */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Audience &amp; Reach Metrics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Total Audience Reach</label>
            <input
              type="number"
              value={mediaKit.total_followers || ''}
              onChange={(e) => setMediaKit({ ...mediaKit, total_followers: Number(e.target.value) })}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Monthly Impressions</label>
            <input
              type="number"
              value={mediaKit.monthly_impressions || ''}
              onChange={(e) => setMediaKit({ ...mediaKit, monthly_impressions: Number(e.target.value) })}
              placeholder="e.g. 250000"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Avg Engagement Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={mediaKit.engagement_rate || ''}
              onChange={(e) => setMediaKit({ ...mediaKit, engagement_rate: Number(e.target.value) })}
              placeholder="e.g. 4.8"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Primary Content Niche</label>
            <input
              type="text"
              value={mediaKit.primary_niche || ''}
              onChange={(e) => setMediaKit({ ...mediaKit, primary_niche: e.target.value })}
              placeholder="e.g. Tech &amp; Lifestyle"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Top Audience Country</label>
            <input
              type="text"
              value={mediaKit.audience_country || ''}
              onChange={(e) => setMediaKit({ ...mediaKit, audience_country: e.target.value })}
              placeholder="e.g. United States"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 4. Rate Card & Deliverables */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Rate Card &amp; Deliverables</span>
          </h3>
          <span className="text-[11px] text-neutral-400 font-medium">
            {packageCount} Packages listed
          </span>
        </div>

        {/* Existing packages */}
        <div className="flex flex-col gap-2.5">
          {packageCount === 0 ? (
            <div className="py-6 px-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 text-center">
              <p className="text-xs text-neutral-500">No sponsorship packages created yet.</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">Add your first package below to activate your Media Kit.</p>
            </div>
          ) : (
            mediaKit.rate_cards.map((item) => {
              const isEditing = editingId === item.id;

              // Card in Edit Mode
              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/50 flex flex-col gap-3 transition shadow-lg shadow-amber-500/5"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <Pencil className="w-3 h-3" /> Edit Sponsorship Package
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 rounded-md text-neutral-400 hover:text-white transition"
                        title="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white outline-none cursor-pointer focus:border-amber-500/50"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Curiolot Bio">Curiolot Bio</option>
                        <option value="Other">Other</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Deliverable"
                        value={editDeliverable}
                        onChange={(e) => setEditDeliverable(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50"
                      />

                      <input
                        type="number"
                        placeholder="Price ($ USD)"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : '')}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Short description / details (optional)"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50"
                      />

                      <input
                        type="url"
                        placeholder="Sample Video URL (optional)"
                        value={editSampleUrl}
                        onChange={(e) => setEditSampleUrl(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePackage(item.id)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Update Package</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Normal Card View
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 transition"
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                        {item.platform}
                      </span>
                      <p className="text-xs font-bold text-white truncate">{item.deliverable}</p>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.description}</p>
                    )}
                    {item.sample_url && (
                      <p className="text-[10px] text-amber-400/80 truncate mt-0.5 flex items-center gap-1">
                        <Video className="w-3 h-3 shrink-0" />
                        <span>Sample: {item.sample_url}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-amber-400 mr-1">${item.price}</span>
                    
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-neutral-400 hover:text-amber-400 transition"
                      title="Edit package"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(item.id)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition"
                      title="Delete package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Package Form */}
        <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-dashed border-neutral-800 flex flex-col gap-3 mt-2">
          <span className="text-[11px] font-bold text-neutral-300">Add New Sponsorship Package</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white outline-none cursor-pointer"
            >
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Curiolot Bio">Curiolot Bio</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Deliverable (e.g. 1x Reel Video)"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition"
            />

            <input
              type="number"
              placeholder="Price ($ USD)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Short description / details (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition"
            />

            <input
              type="url"
              placeholder="Sample Video URL (e.g. YouTube / TikTok sample)"
              value={newSampleUrl}
              onChange={(e) => setNewSampleUrl(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition"
            />
          </div>

          <button
            type="button"
            onClick={handleAddPackage}
            className="self-end px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Footer: Toggle Switch & Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        {/* Toggle Switch */}
        <label className={`flex items-center gap-3 select-none ${packageCount === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className="relative">
            <input
              type="checkbox"
              checked={isSwitchOn}
              disabled={packageCount === 0}
              onChange={handleToggleActive}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                isSwitchOn ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            />
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                isSwitchOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{isSwitchOn ? 'Media Kit Active' : 'Media Kit Disabled'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSwitchOn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
            </span>
            <span className="text-[10px] text-neutral-400">
              {packageCount === 0
                ? 'Add at least 1 package to activate'
                : isSwitchOn
                ? 'Visible on public bio & live preview'
                : 'Hidden from bio profile'}
            </span>
          </div>
        </label>

        {/* Save Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {savedSuccess && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Updated!
            </p>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Media Kit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}