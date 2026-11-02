'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  DollarSign,
  ExternalLink,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Crown,
  Tag,
} from 'lucide-react';

export interface ProductItem {
  id: string;
  username: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  access_type: 'direct' | 'external_link' | 'pin_lock';
  pin_code?: string;
  cover_image?: string;
  file_url: string;
  button_text: string;
  is_active: number;
  downloads_count: number;
  created_at: number;
}

interface TabStoreProps {
  activeUsername: string;
  isProUser: boolean;
}

const CATEGORIES = [
  'Digital Asset',
  'Lightroom Preset',
  'Video LUTs',
  '3D Model & Assets',
  'Wallpaper Pack',
  'E-Book & Guide',
  'Notion Template',
  'Source Code',
  'Prompt Pack',
];

export default function TabStore({ activeUsername, isProUser }: TabStoreProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Digital Asset');
  const [price, setPrice] = useState('0');
  const [accessType, setAccessType] = useState<'direct' | 'external_link' | 'pin_lock'>('direct');
  const [pinCode, setPinCode] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [buttonText, setButtonText] = useState('Download Now');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProducts = async () => {
    if (!activeUsername) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?username=${encodeURIComponent(activeUsername)}&admin=true`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load store products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeUsername]);

  const handleAccessTypeChange = (newType: 'direct' | 'external_link' | 'pin_lock') => {
    setAccessType(newType);
    if (newType === 'direct') {
      setButtonText(parseFloat(price) > 0 ? 'Buy & Download' : 'Download Now');
    } else if (newType === 'external_link') {
      setButtonText('Buy Now');
    } else if (newType === 'pin_lock') {
      setButtonText('Unlock with PIN');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Product title and target URL are required.' });
      return;
    }

    if (accessType === 'pin_lock' && !pinCode.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please define a numeric or text PIN code for this drop.' });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          title: title.trim(),
          category,
          price: parseFloat(price) || 0,
          access_type: accessType,
          pin_code: accessType === 'pin_lock' ? pinCode.trim() : null,
          description: description.trim(),
          cover_image: coverImage.trim(),
          file_url: fileUrl.trim(),
          button_text: buttonText.trim() || 'Download Now',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTitle('');
        setDescription('');
        setCoverImage('');
        setFileUrl('');
        setPinCode('');
        setPrice('0');
        setAccessType('direct');
        setButtonText('Download Now');
        setShowAddForm(false);
        setFeedbackMsg({ type: 'success', text: 'Digital drop published successfully!' });
        fetchProducts();
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to publish product.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error while publishing product.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: newStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, is_active: newStatus } : item))
        );
      }
    } catch {
      alert('Failed to update product visibility.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this digital product?')) return;

    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch {
      alert('Network error while deleting product.');
    }
  };

  const isFreePlanExhausted = !isProUser && products.length >= 2;
  const activeProductsCount = products.filter((p) => p.is_active === 1).length;

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>Digital Store &amp; Drops</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Deliver downloadable assets, presets, templates, or e-books directly to your audience with zero platform fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition"
            title="Refresh Store Items"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {isFreePlanExhausted ? (
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>Quota Reached (2/2)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel' : 'Add Digital Drop'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Active Drops</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{activeProductsCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Plan Capacity</span>
            <p className="text-lg font-black text-white mt-0.5">
              {isProUser ? 'Unlimited (PRO)' : `${products.length}/2 Drops`}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Platform Fee</span>
            <p className="text-lg font-black text-amber-400 mt-0.5">0% (Keep 100%)</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Free Plan Upgrade Banner */}
      {!isProUser && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Free Creator Plan: 2 Digital Drops Included</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Upgrade to PRO to publish unlimited products and unlock PIN-Protected VIP sales for direct bank/QRIS transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Add New Product Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddProduct}
          className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4 shadow-xl"
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Create New Digital Drop</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cinematic Urban Lightroom Presets"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Access / Fulfillment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Access &amp; Fulfillment Model</label>
              <select
                value={accessType}
                onChange={(e) => handleAccessTypeChange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="direct">Free / Direct Download Link</option>
                <option value="external_link">External Payment Link (Lynk.id, Gumroad, Mayar)</option>
                <option value="pin_lock" disabled={!isProUser}>
                  PIN-Protected Drop {isProUser ? '(VIP / Manual Transfer)' : '[PRO Only]'}
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">
                Display Price ($ USD) &bull; Enter 0 for Free
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition font-bold"
                />
                <DollarSign className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Conditional PIN Code Field */}
          {accessType === 'pin_lock' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 flex flex-col gap-2">
              <label className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Secret Passcode / PIN *</span>
              </label>
              <input
                type="text"
                required
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. VIP2026 or 8821"
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider transition"
              />
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Buyers will enter this code on your bio link to unlock the download file after transferring to your bank or QRIS.
              </p>
            </div>
          )}

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              {accessType === 'external_link' ? 'External Checkout URL *' : 'Cloud File Download URL *'}
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder={
                  accessType === 'external_link'
                    ? 'https://lynk.id/... or https://gumroad.com/l/...'
                    : 'https://drive.google.com/file/d/... or Dropbox direct link'
                }
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Cover Preview Image URL (Optional)</label>
              <div className="relative">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or direct image link"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <ImageIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Button Call-to-Action</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Download Now / Buy Drop"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Description / Deliverable Scope</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What files are included in this drop (e.g. 5x .xmp preset files, 1x instruction guide)?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Drop'}
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs flex flex-col items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-neutral-600" />
            <p>No digital products published yet.</p>
            {!isFreePlanExhausted && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-emerald-400 hover:underline mt-1 font-semibold"
              >
                Create your first drop
              </button>
            )}
          </div>
        ) : (
          products.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-neutral-900 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.is_active === 1
                  ? 'border-neutral-800 hover:border-neutral-700'
                  : 'border-neutral-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {item.cover_image ? (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-semibold">
                      {item.category}
                    </span>

                    {/* Access Type Badge */}
                    {item.access_type === 'pin_lock' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>PIN: {item.pin_code || 'Hidden'}</span>
                      </span>
                    )}

                    {item.access_type === 'external_link' && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-semibold flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>External Checkout</span>
                      </span>
                    )}

                    {/* Price Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        Number(item.price) === 0
                          ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                          : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {Number(item.price) === 0 ? 'FREE DROP' : `$${item.price}`}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Verify Target URL</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    item.is_active === 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                  title={item.is_active === 1 ? 'Live on Bio Link (Click to Hide)' : 'Hidden from Bio Link (Click to Show)'}
                >
                  {item.is_active === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(item.id)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700/60 transition"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}