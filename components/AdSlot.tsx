'use client';

import React, { useEffect } from 'react';

interface AdSlotProps {
  className?: string;
  label?: string;
  adSlot?: string; // AdSense ad unit ID (e.g., '1234567890')
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({ 
  className = '', 
  label = 'Sponsored Space',
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true
}) => {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const hasAdSense = publisherId && adSlot;

  useEffect(() => {
    if (hasAdSense && typeof window !== 'undefined') {
      try {
        // @ts-ignore - adsbygoogle is loaded by AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [hasAdSense]);

  if (hasAdSense) {
    return (
      <div className={`w-full px-4 ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </div>
    );
  }

  // Fallback placeholder when AdSense is not configured
  return (
    <div className={`w-full px-4 ${className}`}>
      <div className="w-full h-24 rounded-xl border border-dashed border-slate-700 bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_10px,#1e293b_10px,#1e293b_20px)] flex items-center justify-center overflow-hidden">
         <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">{label}</span>
      </div>
    </div>
  );
};