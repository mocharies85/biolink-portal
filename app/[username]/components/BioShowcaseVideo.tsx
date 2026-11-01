import React from 'react';
import { UserProfile, ThemeStyle } from '../types';

interface BioShowcaseVideoProps {
  profile: UserProfile;
  isPro: boolean;
  theme: ThemeStyle;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function BioShowcaseVideo({
  profile,
  isPro,
  theme,
  videoRef,
}: BioShowcaseVideoProps) {
  if (!isPro || profile.show_featured_video !== 1 || !profile.featured_video_url) {
    return null;
  }

  return (
    <section className="w-full mb-6">
      <div className={`w-full rounded-2xl overflow-hidden border p-3 shadow-lg transition-all ${theme.cardBg} ${theme.cardBorder}`}>
        {profile.featured_video_title && (
          <p className={`text-xs font-bold mb-2.5 px-1 truncate ${theme.textPrimary}`}>
            {profile.featured_video_title}
          </p>
        )}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
          <video
            ref={videoRef}
            src={profile.featured_video_url}
            controls
            autoPlay={profile.featured_video_autoplay === 1}
            muted={profile.featured_video_autoplay === 1}
            loop={profile.featured_video_autoplay === 1}
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}