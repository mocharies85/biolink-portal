'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  Mail,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role?: string;
  is_pro?: number;
  created_at?: number;
}

interface MessageRecord {
  id: number;
  username: string;
  email: string;
  message: string;
  status: string;
  created_at: number;
}

interface AdminData {
  stats: {
    total: number;
    pro: number;
    free: number;
    estimatedRevenue: number;
  };
  users: UserRecord[];
  messages: MessageRecord[];
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'messages'>('members');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleProStatus = async (userId: number, currentStatus: number | undefined) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_pro: currentStatus === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      alert('Failed to update PRO status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
              title="Back to Member Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-xl font-bold text-white tracking-tight">Superadmin Control Hub</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  MASTER ACCESS
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Overview of user registrations, subscription tiers, and member support tickets
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Total Registered</span>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{data?.stats.total ?? 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>PRO Subscribers</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">{data?.stats.pro ?? 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Free Creators</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{data?.stats.free ?? 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Est. Revenue / Mo</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">${data?.stats.estimatedRevenue ?? 0}</p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'members' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Registered Users ({data?.users.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'messages' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Support Tickets ({data?.messages.length ?? 0})</span>
          </button>
        </div>

        {/* TAB 1: User Management Table */}
        {activeTab === 'members' && (
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/60">
            <div className="grid grid-cols-12 px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-xs font-bold text-neutral-400">
              <div className="col-span-4">User / Email</div>
              <div className="col-span-3">Plan Status</div>
              <div className="col-span-3">Public Bio Link</div>
              <div className="col-span-2 text-right">Admin Action</div>
            </div>
            <div className="divide-y divide-neutral-800 text-xs">
              {data?.users.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-xs">No registered users found.</div>
              ) : (
                data?.users.map((u) => (
                  <div key={u.id} className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-neutral-900 transition">
                    <div className="col-span-4 truncate">
                      <p className="font-semibold text-white">@{u.username}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{u.email}</p>
                    </div>
                    <div className="col-span-3">
                      {u.is_pro === 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                          ★ PRO Member
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px]">
                          Free Tier
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-neutral-400">
                      <a
                        href={`/${u.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 underline flex items-center gap-1 w-fit"
                      >
                        <span>/{u.username}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-600" />
                      </a>
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => toggleProStatus(u.id, u.is_pro)}
                        disabled={actionLoadingId === u.id}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition disabled:opacity-50 ${
                          u.is_pro === 1
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {actionLoadingId === u.id
                          ? 'Updating...'
                          : u.is_pro === 1
                          ? 'Revoke PRO'
                          : 'Grant PRO'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Support Messages */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-3">
            {data?.messages.length === 0 ? (
              <div className="p-10 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-neutral-900 text-xs">
                No support messages or member inquiries received yet.
              </div>
            ) : (
              data?.messages.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">@{m.username}</span>
                      <span className="text-neutral-500 text-[11px]">({m.email})</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3.5 rounded-xl border border-neutral-850">
                    {m.message}
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <a
                      href={`mailto:${m.email}?subject=Response to Curiolot Support Inquiry`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Reply via Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}