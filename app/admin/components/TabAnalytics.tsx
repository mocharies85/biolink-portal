'use client';

import React from 'react';
import { BarChart3, TrendingUp, Lock } from 'lucide-react';

interface TabAnalyticsProps {
  viewsCount: number;
  clicksCount: number;
  isProUser: boolean;
  activeUsername: string;
  setShowUpgradeModal: (show: boolean) => void;
  setShowDetailedInsights: (show: boolean) => void;
  fetchDetailedAnalytics: () => Promise<void>;
}

export default function TabAnalytics({
  viewsCount,
  clicksCount,
  isProUser,
  activeUsername,
  setShowUpgradeModal,
  setShowDetailedInsights,
  fetchDetailedAnalytics,
}: TabAnalyticsProps) {
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Audience Insights</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Profile and link performance for @{activeUsername}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Total Views</span>
          <span className="text-2xl font-bold text-white block mt-2">
            {viewsCount.toLocaleString()}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Link Clicks</span>
          <span className="text-2xl font-bold text-white block mt-2">
            {clicksCount.toLocaleString()}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Account Type</span>
          <span
            className={`text-xl font-bold block mt-2 ${
              isProUser ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isProUser ? 'PRO Tier' : 'Free Tier'}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Detailed Link Analytics</h3>
              {!isProUser && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PRO ONLY
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Analyze individual link CTR, device breakdown, and live traffic referrers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isProUser) {
              fetchDetailedAnalytics();
              setShowDetailedInsights(true);
            } else {
              setShowUpgradeModal(true);
            }
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
            isProUser
              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/20'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 shadow-lg shadow-amber-500/20'
          }`}
        >
          {isProUser ? (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>Open Analytics Dashboard</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Pro Insights</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}