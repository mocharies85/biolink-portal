import React from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';

interface BioMediaKitBannerProps {
  username: string;
  isPro: boolean;
  isEnabled: boolean;
}

export default function BioMediaKitBanner({ username, isPro, isEnabled }: BioMediaKitBannerProps) {
  if (!isPro || !isEnabled) return null;

  return (
    <div className="w-full mb-5">
      <a
        href={`/${username}/mediakit`}
        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-between transition group shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span>View Creator Media Kit &amp; Rates</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition" />
      </a>
    </div>
  );
}