import React from 'react';
import { BusStop } from '../types';
import { MapPin, Clock, ChevronDown, Sparkles } from 'lucide-react';

interface ActiveStopBannerProps {
  currentStop: BusStop;
  totalStops: number;
  lastUpdated: string;
  onOpenSelector: () => void;
  serviceCount: number;
}

export const ActiveStopBanner: React.FC<ActiveStopBannerProps> = ({
  currentStop,
  totalStops,
  lastUpdated,
  onOpenSelector,
  serviceCount,
}) => {
  return (
    <div className="pt-4 pb-2">
      {/* SELECT BUS STOP Header */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          SELECT BUS STOP
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {totalStops} stops available
        </span>
      </div>

      {/* Select Bus Stop Dropdown Button */}
      <button
        id="select-bus-stop-dropdown-btn"
        onClick={onOpenSelector}
        className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:bg-slate-50/50 transition-all p-3.5 mb-5 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 truncate pr-2">
          {currentStop.code} - {currentStop.name} ({currentStop.road})
        </span>
        <ChevronDown className="w-5 h-5 text-[#0d785a] transition-transform group-hover:translate-y-0.5 shrink-0" />
      </button>

      {/* Current Stop Info Card */}
      <div className="bg-[#f2fbf7] border border-emerald-100 rounded-2xl p-3.5 mb-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0d785a] text-white flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-[#0d785a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                {currentStop.code}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {currentStop.road}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              {currentStop.name}
            </h2>
          </div>
        </div>

        {/* Services Count Badge */}
        <div className="shrink-0 pl-2">
          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50/90 px-2.5 py-1 text-xs font-bold text-[#0d785a] whitespace-nowrap shadow-2xs">
            {serviceCount} Services
          </span>
        </div>
      </div>

      {/* NEXT 2 ARRIVALS Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 stroke-[2.2] text-slate-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
            NEXT 2 ARRIVALS
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d785a]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0d785a]" />
          </span>
          <span>Updated {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
