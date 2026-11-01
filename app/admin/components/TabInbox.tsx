'use client';

import React from 'react';
import { MessageSquare, Download, Sparkles } from 'lucide-react';
import { MessageItem } from '../types';

interface TabInboxProps {
  messages: MessageItem[];
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
  const handleExportCsv = () => {
    if (!isProUser) {
      alert('Exporting messages is an exclusive PRO feature.');
      return;
    }
    window.open(
      `/api/export-messages?username=${encodeURIComponent(activeUsername || '')}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Audience Messages</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Read direct inquiries, feedback, and collaboration proposals submitted by your audience.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Direct Messages</h3>

        {isProUser ? (
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        ) : (
          <div
            title="Exclusive PRO Feature"
            className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-500 border border-neutral-700/60 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed opacity-75"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Export to CSV (PRO Only)</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {loadingMessages ? (
          <p className="text-xs text-neutral-500 py-6 text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">Your inbox is empty. No messages received yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">
                  {msg.name || msg.sender_name || 'Anonymous Visitor'}
                </p>
                <span className="text-[10px] text-neutral-500">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              {msg.email && <p className="text-[11px] text-neutral-400">{msg.email}</p>}
              <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-850 mt-1 whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}