'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Briefcase,
  DollarSign,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Building,
  RefreshCw,
  Inbox,
  Trash2,
} from 'lucide-react';

export interface BrandDealItem {
  id: string;
  brand_name: string;
  contact_name?: string;
  contact_email: string;
  selected_packages: Array<{ deliverable: string; price: number; platform: string }>;
  total_budget: number;
  campaign_brief?: string;
  target_date?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: number;
}

export interface FanMessageItem {
  id: number | string;
  sender_name?: string;
  sender_email?: string;
  message: string;
  created_at: number;
}

interface TabInboxProps {
  messages: FanMessageItem[];
  loadingMessages: boolean;
  activeUsername: string;
  isProUser: boolean;
}

export default function TabInbox({
  messages,
  loadingMessages,
  activeUsername,
  isProUser,
}: TabInboxProps) {
  const [filterType, setFilterType] = useState<'all' | 'deals' | 'messages'>('all');
  const [deals, setDeals] = useState<BrandDealItem[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeals = async () => {
    if (!activeUsername) return;
    setLoadingDeals(true);
    try {
      const res = await fetch(`/api/deals?username=${encodeURIComponent(activeUsername)}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Failed to load brand deals:', err);
    } finally {
      setLoadingDeals(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [activeUsername]);

  const handleUpdateStatus = async (dealId: string, newStatus: 'accepted' | 'declined') => {
    setUpdatingId(dealId);
    try {
      const res = await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, status: newStatus }),
      });

      if (res.ok) {
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
        );
      } else {
        alert('Failed to update deal status.');
      }
    } catch {
      alert('Network error while updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handler to delete a sponsorship deal
  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this sponsorship deal?')) return;

    try {
      const res = await fetch(`/api/deals?id=${encodeURIComponent(dealId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== dealId));
      } else {
        alert('Failed to delete deal from server.');
      }
    } catch {
      alert('Network error while deleting deal.');
    }
  };

  const totalDealValue = deals
    .filter((d) => d.status === 'accepted')
    .reduce((acc, curr) => acc + (curr.total_budget || 0), 0);

  const pendingDealsCount = deals.filter((d) => d.status === 'pending').length;

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-emerald-400" />
            <span>Messaging &amp; Inquiries</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review incoming audience fan notes and sponsorship proposals submitted through your Media Kit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDeals()}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDeals ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Highlights Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Pending Sponsorships</span>
            <p className="text-lg font-black text-amber-400 mt-0.5">{pendingDealsCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Locked Deal Pipeline</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">${totalDealValue}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Audience Messages</span>
            <p className="text-lg font-black text-white mt-0.5">{messages.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'all'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Activity ({deals.length + messages.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('deals')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filterType === 'deals'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>Brand Deals</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-[10px]">
            {deals.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('messages')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filterType === 'messages'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fan Messages</span>
          <span className="px-1.5 py-0.2 rounded-md bg-neutral-800 text-[10px]">
            {messages.length}
          </span>
        </button>
      </div>

      {/* Content Stream */}
      <div className="flex flex-col gap-3">
        {/* Brand Deals Section */}
        {(filterType === 'all' || filterType === 'deals') && (
          <>
            {deals.length > 0 && filterType === 'all' && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mt-1">
                Sponsorship Proposals
              </span>
            )}

            {deals.map((deal) => {
              const dateStr = new Date(deal.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              // Construct clean Web Gmail compose URL without broken newlines
              const mailSubject = `Collaboration Inquiry from @${activeUsername} - ${deal.brand_name}`;
              const mailBody = `Hi ${deal.contact_name || deal.brand_name},\n\nThank you for reaching out via my Curiolot Media Kit! I have accepted your sponsorship proposal and would love to discuss the project schedule and deliverables.\n\nBest regards,\n@${activeUsername}`;
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(deal.contact_email)}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

              return (
                <div
                  key={deal.id}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4 shadow-sm hover:border-neutral-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{deal.brand_name}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            Sponsorship Deal
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                              deal.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : deal.status === 'declined'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {deal.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Contact: {deal.contact_name || 'Brand Representative'}</span>
                          <span>&bull;</span>
                          <span className="text-neutral-300">{deal.contact_email}</span>
                          <span>&bull;</span>
                          <span>{dateStr}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-neutral-400 block">Proposed Value</span>
                      <span className="text-base font-black text-amber-400">
                        ${deal.total_budget}
                      </span>
                    </div>
                  </div>

                  {/* Selected Deliverables Tags */}
                  {Array.isArray(deal.selected_packages) && deal.selected_packages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] font-bold text-neutral-400 self-center mr-1">
                        Selected Packages:
                      </span>
                      {deal.selected_packages.map((pkg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-200"
                        >
                          {pkg.deliverable} (${pkg.price})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Campaign Brief */}
                  {deal.campaign_brief && (
                    <div className="text-xs text-neutral-300 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/60 leading-relaxed whitespace-pre-wrap">
                      <p className="text-[10px] font-bold text-neutral-500 mb-1">CAMPAIGN BRIEF:</p>
                      {deal.campaign_brief}
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                      {deal.target_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Target Date: {deal.target_date}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Direct Web Gmail Reply */}
                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-white font-semibold text-xs flex items-center gap-1.5 transition border border-neutral-700/60"
                        title="Open in Gmail"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reply via Gmail</span>
                      </a>

                      {/* Copy Email Button */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(deal.contact_email);
                          alert(`Email copied to clipboard: ${deal.contact_email}`);
                        }}
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition border border-neutral-700/60"
                        title="Copy email address"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Deal Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition border border-neutral-700/60"
                        title="Delete sponsorship deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {deal.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={updatingId === deal.id}
                            onClick={() => handleUpdateStatus(deal.id, 'accepted')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            type="button"
                            disabled={updatingId === deal.id}
                            onClick={() => handleUpdateStatus(deal.id, 'declined')}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center gap-1 transition disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Fan Messages Section */}
        {(filterType === 'all' || filterType === 'messages') && (
          <>
            {messages.length > 0 && filterType === 'all' && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mt-4">
                Audience Fan Messages
              </span>
            )}

            {messages.length === 0 && filterType === 'messages' && (
              <div className="py-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs">
                No audience messages received yet.
              </div>
            )}

            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {msg.sender_name || 'Anonymous Visitor'}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                  {msg.message}
                </p>

                {msg.sender_email && (
                  <div className="self-end pt-1">
                    <a
                      href={`mailto:${msg.sender_email}`}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{msg.sender_email}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {deals.length === 0 && messages.length === 0 && (
          <div className="py-16 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs flex flex-col items-center gap-2">
            <Inbox className="w-8 h-8 text-neutral-600" />
            <p>Your inbox is empty right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}