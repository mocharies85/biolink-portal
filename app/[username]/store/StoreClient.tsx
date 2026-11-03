'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Download,
  Lock,
  KeyRound,
  X,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

export interface ProductItem {
  id: string;
  username: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  access_type: 'direct' | 'external_link' | 'pin_lock';
  cover_image?: string;
  file_url: string;
  button_text: string;
  is_active: number;
  created_at: number;
}

interface StoreClientProps {
  username: string;
}

export default function StoreClient({ username }: StoreClientProps) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Detail & Checkout
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Fetch Profile Info
    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error('Failed to load profile:', err));

    // Fetch Products
    fetch(`/api/products?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, [username]);

  // Extract available categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenProduct = (product: ProductItem) => {
    setActiveModalProduct(product);
    setPinInput('');
    setPinError('');
  };

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProduct || !pinInput.trim()) return;

    setUnlocking(true);
    setPinError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock_pin',
          productId: activeModalProduct.id,
          pin: pinInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.file_url) {
        window.open(data.file_url, '_blank', 'noopener,noreferrer');
        setActiveModalProduct(null);
        setPinInput('');
      } else {
        setPinError(data.error || 'Incorrect PIN code.');
      }
    } catch {
      setPinError('Connection error. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              @{username}&apos;s Store
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8 border-b border-neutral-850">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={profile?.avatar || '/default-avatar.svg'}
            alt={profile?.name || username}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/30 bg-neutral-900 shadow-xl"
          />
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white">{profile?.name || `@${username}`}</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Official Creator Store
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              {profile?.bio ||
                'Explore exclusive digital assets, presets, templates, and downloadable resources.'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-neutral-700" />
            <p className="text-sm font-semibold text-neutral-400">No products found</p>
            <p className="text-xs text-neutral-600">Try selecting another category or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenProduct(item)}
                className="group cursor-pointer rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/40 transition duration-200 flex flex-col overflow-hidden shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1"
              >
                {/* Product Cover */}
                <div className="w-full aspect-[4/3] bg-neutral-950 relative overflow-hidden flex items-center justify-center">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-600">
                      <Layers className="w-10 h-10" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-black shadow-md backdrop-blur-md ${
                      Number(item.price) === 0
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-emerald-500 text-neutral-950'
                    }`}
                  >
                    {Number(item.price) === 0 ? 'FREE' : `$${item.price}`}
                  </span>

                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-300">
                    {item.category}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      {item.access_type === 'pin_lock' ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Passcode Locked</span>
                        </>
                      ) : Number(item.price) === 0 ? (
                        <>
                          <Download className="w-3 h-3 text-blue-400" />
                          <span>Instant Download</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>Direct Checkout</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                      <span>View</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail & Checkout Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Cover Image */}
            {activeModalProduct.cover_image && (
              <img
                src={activeModalProduct.cover_image}
                alt={activeModalProduct.title}
                className="w-full h-56 rounded-2xl object-cover bg-neutral-950 border border-neutral-800"
              />
            )}

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                  {activeModalProduct.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    Number(activeModalProduct.price) === 0
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {Number(activeModalProduct.price) === 0 ? 'FREE DOWNLOAD' : `$${activeModalProduct.price}`}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeModalProduct.title}</h2>
            </div>

            {/* Product Scope / Description */}
            <div className="text-xs text-neutral-300 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 leading-relaxed whitespace-pre-wrap">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Included Deliverables &amp; Details:
              </p>
              {activeModalProduct.description || 'Includes immediate digital file delivery.'}
            </div>

            {/* Actions Depending on Fulfillment Type */}
            {activeModalProduct.access_type === 'pin_lock' ? (
              <form onSubmit={handleUnlockPin} className="flex flex-col gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-amber-400 font-bold block mb-1">
                    Enter Secret Passcode / PIN to Unlock:
                  </label>
                  <input
                    type="text"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter passkey..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                  />
                  {pinError && <p className="text-[11px] text-rose-400 mt-1 text-center">{pinError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={unlocking}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{unlocking ? 'Verifying...' : 'Unlock & Access Files'}</span>
                </button>
              </form>
            ) : (
              <a
                href={activeModalProduct.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 text-center"
              >
                {Number(activeModalProduct.price) === 0 ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Files Instantly</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Proceed to Checkout (${activeModalProduct.price})</span>
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}