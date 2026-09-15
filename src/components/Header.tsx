import React from 'react';
import { Bus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="bg-[#0d785a] text-white px-5 pt-5 pb-5 rounded-t-[32px] sm:rounded-t-3xl shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs">
            <Bus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                BusNow
              </h1>
              <span className="bg-white/20 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none border border-white/25">
                SG
              </span>
            </div>
            <p className="text-emerald-100 text-xs font-medium mt-1 tracking-wide">
              Live Bus Arrival Times
            </p>
          </div>
        </div>

        {/* Right: Refresh button */}
        <button
          id="refresh-timings-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh timings"
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white border border-white/20 backdrop-blur-xs focus:outline-hidden"
          aria-label="Refresh arrival times"
        >
          <RefreshCw
            className={`w-4 h-4 stroke-[2.5] transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>
    </header>
  );
};
