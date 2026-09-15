import React from 'react';
import { BusType } from '../types';

interface BusTypeBadgeProps {
  type: BusType;
  wheelchair?: boolean;
}

export const BusTypeBadge: React.FC<BusTypeBadgeProps> = ({ type }) => {
  return (
    <div id={`bus-type-badge-${type}`} className="flex flex-col items-center justify-center pl-2 pr-1">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:border-emerald-200 transition-colors">
        {type === 'DD' ? (
          // Double Decker Icon: Two tiers
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="17" rx="3" />
            <line x1="4" y1="10" x2="20" y2="10" />
            <line x1="4" y1="16" x2="20" y2="16" />
            {/* Windows Upper Deck */}
            <circle cx="8" cy="6.5" r="1" fill="currentColor" />
            <circle cx="16" cy="6.5" r="1" fill="currentColor" />
            {/* Windows Lower Deck */}
            <circle cx="8" cy="13" r="1" fill="currentColor" />
            <circle cx="16" cy="13" r="1" fill="currentColor" />
            {/* Wheels */}
            <circle cx="8" cy="20" r="1.5" />
            <circle cx="16" cy="20" r="1.5" />
          </svg>
        ) : type === 'BD' ? (
          // Bendy bus icon
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="9" height="13" rx="2" />
            <line x1="12" y1="7" x2="12" y2="18" strokeDasharray="1 2" />
            <rect x="13" y="6" width="9" height="13" rx="2" />
            <circle cx="6" cy="19" r="1.5" />
            <circle cx="18" cy="19" r="1.5" />
          </svg>
        ) : (
          // Single Decker Icon
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="14" rx="3" />
            <line x1="4" y1="12" x2="20" y2="12" />
            {/* Headlights */}
            <circle cx="7.5" cy="15.5" r="1" fill="currentColor" />
            <circle cx="16.5" cy="15.5" r="1" fill="currentColor" />
            {/* Wheels */}
            <circle cx="8" cy="19" r="1.5" />
            <circle cx="16" cy="19" r="1.5" />
          </svg>
        )}
      </div>
      <span className="text-[11px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">
        {type}
      </span>
    </div>
  );
};
