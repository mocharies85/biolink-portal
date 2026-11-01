import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, Send } from 'lucide-react';
import { ThemeStyle } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface BioMessagingProps {
  username: string;
  theme: ThemeStyle;
}

export default function BioMessaging({ username, theme }: BioMessagingProps) {
  const { t } = useLanguage();
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          sender: senderName.trim() || 'Anonymous',
          content: message.trim(),
        }),
      });

      if (res.ok) {
        setIsSent(true);
        setSenderName('');
        setMessage('');
        setTimeout(() => setIsSent(false), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to send message.');
      }
    } catch {
      alert('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`w-full p-5 rounded-2xl border backdrop-blur-md mb-10 ${theme.inboxBg}`}>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className={`w-4 h-4 ${theme.accent}`} />
        <h2 className="text-sm font-semibold">{t('messages')}</h2>
      </div>
      <p className={`text-xs mb-4 leading-relaxed ${theme.textSecondary}`}>
        {t('messageDesc')}
      </p>

      {isSent ? (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center gap-1.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <p className="text-xs font-semibold text-emerald-300">{t('msgSuccessTitle')}</p>
          <p className="text-[11px] text-neutral-400">{t('msgSuccessDesc')}</p>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2.5">
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            placeholder={t('messagePlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>{t('sendingBtn')}</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('sendBtn')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
}