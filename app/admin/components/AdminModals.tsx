'use client';

import React from 'react';
import {
  X,
  QrCode,
  Download,
  Sparkles,
  Loader2,
  BarChart3,
  Smartphone,
  Globe,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { DetailedAnalyticsData, LinkItem } from '../types';

interface AdminModalsProps {
  activeUsername: string;

  // QR Modal
  showQrModal: boolean;
  setShowQrModal: (val: boolean) => void;
  qrImageUrl: string;

  // Upgrade Modal
  showUpgradeModal: boolean;
  setShowUpgradeModal: (val: boolean) => void;
  handlePaddleCheckout: () => void;
  checkoutLoading: boolean;

  // Detailed Analytics Modal
  showDetailedInsights: boolean;
  setShowDetailedInsights: (val: boolean) => void;
  detailedData: DetailedAnalyticsData | null;
  loadingDetailed: boolean;
  viewsCount: number;
  clicksCount: number;
  links: LinkItem[];

  // Support Modal
  showSupportModal: boolean;
  setShowSupportModal: (val: boolean) => void;
  supportMessage: string;
  setSupportMessage: (val: string) => void;
  handleSendSupport: (e: React.FormEvent) => void;
  sendingSupport: boolean;
  supportSentSuccess: boolean;
}

export default function AdminModals({
  activeUsername,
  showQrModal,
  setShowQrModal,
  qrImageUrl,
  showUpgradeModal,
  setShowUpgradeModal,
  handlePaddleCheckout,
  checkoutLoading,
  showDetailedInsights,
  setShowDetailedInsights,
  detailedData,
  loadingDetailed,
  viewsCount,
  clicksCount,
  links,
  showSupportModal,
  setShowSupportModal,
  supportMessage,
  setSupportMessage,
  handleSendSupport,
  sendingSupport,
  supportSentSuccess,
}: AdminModalsProps) {
  // Helper Download QR Code
  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${activeUsername}-biolink-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  // Helper Badge Jadwal Link
  const getScheduleBadge = (link: LinkItem) => {
    if (!link.schedule_start && !link.schedule_end) return null;
    const now = new Date().getTime();

    if (link.schedule_start) {
      const startTime = new Date(link.schedule_start).getTime();
      if (!isNaN(startTime) && now < startTime) {
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ⏳ Scheduled
          </span>
        );
      }
    }

    if (link.schedule_end) {
      const endTime = new Date(link.schedule_end).getTime();
      if (!isNaN(endTime) && now > endTime) {
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ⛔ Expired
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        🟢 Active
      </span>
    );
  };

  return (
    <>
      {/* 1. QR Code Generator Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">Profile QR Code</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
              Scan to open <strong>@{activeUsername}</strong>'s biolink hub instantly.
            </p>

            <div className="my-5 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img src={qrImageUrl} alt="Biolink QR Code" className="w-48 h-48 object-contain" />
            </div>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PRO Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-xl mx-auto shadow-lg shadow-amber-500/25">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-white mt-3">Upgrade to Curiolot Link PRO</h3>

              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-3xl font-black text-white tracking-tight">$5</span>
                <span className="text-xs text-neutral-400 font-medium">/ month</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Cancel anytime
                </span>
              </div>

              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Supercharge your biolink with creator tools designed to boost engagement, branding, and click conversions.
              </p>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Creator Media Kit (0% Fee):</strong> Accept brand deals directly with verified metrics and keep 100% of your earnings.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Profile Background Music:</strong> Play custom ambient soundtracks on your public page with automated video sync.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">PIN Code Protection:</strong> Lock exclusive downloads, paid content, or private communities behind a passcode.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Smart Link Scheduling:</strong> Set release dates and expiration countdowns for limited-time offers.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Custom Wallpapers &amp; 5 PRO Themes:</strong> Upload high-res backdrops and access Cyberpunk, Sunset, &amp; Aurora themes.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Social Share Card &amp; SEO:</strong> Custom 1200x630 rich snippet cards on WhatsApp, Telegram, X, and Facebook.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">Spotlight Glow &amp; 'HOT' Badge:</strong> Animated neon border and badges to maximize link clicks.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-white">60s Video &amp; Photo Stories:</strong> Native video streaming via Cloudflare R2 and extended photo carousel.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-neutral-300 leading-relaxed mb-4">
              ⚡ <strong>Instant Activation:</strong> Secure checkout powered by Paddle. Pay via Card or PayPal, and your <strong>@{activeUsername}</strong> account updates immediately.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={handlePaddleCheckout}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading Checkout...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to PRO ($5/mo)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Insights Modal */}
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
                    Performance Analytics Dashboard
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      PRO Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Live audience metrics for @{activeUsername}</p>
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
                  {viewsCount > 0 ? Math.min(100, (clicksCount / viewsCount) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Total Active Links</span>
                <p className="text-lg font-extrabold text-white mt-1">{links.length} Links</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400">Audience Quality</span>
                <p className="text-lg font-extrabold text-amber-400 mt-1">Verified Top Tier</p>
              </div>
            </div>

            {/* Individual Link Performance Table */}
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
                      const rawCtr = viewsCount > 0 ? (linkClicks / viewsCount) * 100 : 0;
                      const linkCtr = Math.min(100, rawCtr).toFixed(1);

                      return (
                        <div
                          key={link.id}
                          className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-neutral-900/30 transition"
                        >
                          <div className="col-span-7 truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-white truncate">{link.title}</p>
                              {getScheduleBadge(link)}
                            </div>
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
              {/* Devices Breakdown */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-neutral-400" /> Devices Breakdown
                  </span>
                  {detailedData && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      {detailedData.totalVisits} visits logged
                    </span>
                  )}
                </h5>
                {loadingDetailed ? (
                  <p className="text-[11px] text-neutral-500 py-5 text-center">Loading device stats...</p>
                ) : !detailedData || detailedData.totalVisits === 0 ? (
                  <div className="py-5 text-center text-[11px] text-neutral-500">No visitor data recorded yet.</div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-[11px]">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Mobile (iOS &amp; Android)</span>
                      <span className="font-bold text-white">{detailedData.devices.mobilePct}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${detailedData.devices.mobilePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-neutral-300 mt-1">
                      <span>Desktop &amp; Tablets</span>
                      <span className="font-bold text-white">{detailedData.devices.desktopPct}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${detailedData.devices.desktopPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h5 className="font-bold text-neutral-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-neutral-400" /> Top Referrers
                  </span>
                </h5>
                {loadingDetailed ? (
                  <p className="text-[11px] text-neutral-500 py-5 text-center">Loading traffic sources...</p>
                ) : !detailedData || detailedData.referrers.length === 0 ? (
                  <div className="py-5 text-center text-[11px] text-neutral-500">No traffic sources recorded yet.</div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-[11px]">
                    {detailedData.referrers.map((ref, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-neutral-300">
                          <span className="font-medium text-neutral-200">{ref.source}</span>
                          <span className="font-bold text-white">
                            {ref.percentage}%{' '}
                            <span className="text-[10px] text-neutral-500 font-normal">
                              ({ref.count})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${ref.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* 4. Support Modal */}
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
                  <p className="text-[11px] text-neutral-400">Assistance for account settings and billing</p>
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
                  <label className="text-xs text-neutral-400 block mb-1">Your Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your inquiry or technical question here..."
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
    </>
  );
}