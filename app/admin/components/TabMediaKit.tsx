'use client';

import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';

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
}

interface TabMediaKitProps {
  activeUsername: string;
  mediaKit: MediaKitData;
  setMediaKit: React.Dispatch<React.SetStateAction<MediaKitData>>;
  isPro?: boolean;
}

export default function TabMediaKit({
  activeUsername,
  mediaKit,
  setMediaKit,
  isPro = false,
}: TabMediaKitProps) {
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Jika bukan PRO, tampilkan layar terkunci (Paywall)
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
            <span>Interactive Rate Cards &amp; Deliverables</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Smart Bundle Calculator (10% discounts)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>1-Click Pitch Deck PDF Exporter</span>
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

  // Form State Tambah Paket Baru untuk user PRO
  const [newPlatform, setNewPlatform] = useState('Instagram');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newDesc, setNewDesc] = useState('');
  const [newSampleUrl, setNewSampleUrl] = useState('');

  const targetUsername = activeUsername || 'aries';

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

    setMediaKit((prev) => ({
      ...prev,
      rate_cards: [...prev.rate_cards, newItem],
    }));

    setNewDeliverable('');
    setNewPrice('');
    setNewDesc('');
    setNewSampleUrl('');
  };

  const handleDeletePackage = (id: string) => {
    setMediaKit((prev) => ({
      ...prev,
      rate_cards: prev.rate_cards.filter((item) => item.id !== id),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/mediakit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          mediaKitData: mediaKit,
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

          <a
            href={`/${targetUsername}/mediakit`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>View Public Media Kit</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </a>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Showcase your audience statistics, reach, and sponsorship pricing packages to close more brand partnerships.
        </p>
      </div>

      {/* Audience & Reach Metrics */}
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
              value={mediaKit.total_followers}
              onChange={(e) => setMediaKit({ ...mediaKit, total_followers: Number(e.target.value) })}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Monthly Impressions</label>
            <input
              type="number"
              value={mediaKit.monthly_impressions}
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
              value={mediaKit.engagement_rate}
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
              value={mediaKit.primary_niche}
              onChange={(e) => setMediaKit({ ...mediaKit, primary_niche: e.target.value })}
              placeholder="e.g. Tech, Gadgets, Digital Art"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Top Audience Country</label>
            <input
              type="text"
              value={mediaKit.audience_country}
              onChange={(e) => setMediaKit({ ...mediaKit, audience_country: e.target.value })}
              placeholder="e.g. United States, Indonesia"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Rate Card & Deliverables */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Rate Card &amp; Deliverables</span>
          </h3>
          <span className="text-[11px] text-neutral-400 font-medium">
            {mediaKit.rate_cards.length} Packages listed
          </span>
        </div>

        {/* List of existing packages */}
        <div className="flex flex-col gap-2.5">
          {mediaKit.rate_cards.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
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

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-black text-amber-400">${item.price}</span>
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
          ))}
        </div>

        {/* Add New Package Form */}
        <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-dashed border-neutral-800 flex flex-col gap-3 mt-2">
          <span className="text-[11px] font-bold text-neutral-300">Add New Sponsorship Package</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white outline-none"
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
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none"
            />

            <input
              type="number"
              placeholder="Price ($ USD)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Short description / details (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none"
            />

            <input
              type="url"
              placeholder="Sample Video URL (e.g. YouTube / TikTok sample)"
              value={newSampleUrl}
              onChange={(e) => setNewSampleUrl(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAddPackage}
            className="self-end px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-1">
        {savedSuccess && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Media Kit updated successfully!
          </p>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Media Kit'}</span>
        </button>
      </div>
    </div>
  );
}