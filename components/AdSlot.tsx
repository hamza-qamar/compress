import React from 'react';

interface AdSlotProps {
  className?: string;
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ className = '', label = 'Sponsored Space' }) => {
  return (
    <div className={`w-full px-4 ${className}`}>
      <div className="w-full h-24 rounded-xl border border-dashed border-slate-700 bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_10px,#1e293b_10px,#1e293b_20px)] flex items-center justify-center overflow-hidden">
         <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">{label}</span>
      </div>
    </div>
  );
};