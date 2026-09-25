import React from 'react';
import { BusService, BusLoad } from '../types';
import { BusTypeBadge } from './BusTypeBadge';
import { Check, AlertCircle, ChevronRight } from 'lucide-react';

interface BusCardProps {
  service: BusService;
  onSelect: (service: BusService) => void;
}

export const BusCard: React.FC<BusCardProps> = ({ service, onSelect }) => {
  const getMinutes = (seconds: number) => Math.max(0, Math.round(seconds / 60));

  const nextMins = service.nextBus ? getMinutes(service.nextBus.seconds) : null;
  const next2Mins = service.nextBus2 ? getMinutes(service.nextBus2.seconds) : null;

  const isNextArriving = service.nextBus && (service.nextBus.seconds <= 45 || nextMins === 0);

  const renderOccupancy = (load: BusLoad) => {
    switch (load) {
      case 'SEA':
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0d785a] whitespace-nowrap">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0d785a] text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Seats Available</span>
          </div>
        );
      case 'SDA':
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0d785a] whitespace-nowrap">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0d785a] text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Standing Available</span>
          </div>
        );
      case 'LSD':
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 whitespace-nowrap">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
            <span>Limited Standing</span>
          </div>
        );
    }
  };

  return (
    <div
      id={`bus-service-card-${service.serviceNo}`}
      onClick={() => onSelect(service)}
      className="group relative w-full max-w-full overflow-hidden box-border bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-emerald-300 transition-all duration-200 p-4 mb-3.5 cursor-pointer select-none"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-full">
        {/* Left: Service number box & Occupancy */}
        <div id={`bus-number-section-${service.serviceNo}`} className="flex flex-col items-start gap-1.5 shrink-0">
          <div id={`bus-number-${service.serviceNo}`} className="w-[68px] h-[50px] bg-[#0d1624] text-white rounded-xl flex items-center justify-center shadow-xs group-hover:bg-[#07101e] transition-colors">
            <span className="font-extrabold text-2xl tracking-tight text-white font-mono">
              {service.serviceNo}
            </span>
          </div>
          {renderOccupancy(service.nextBus?.load || 'SEA')}
        </div>

        {/* Center: Arrival Timings (NEXT & 2ND BUS) */}
        <div className="flex items-center justify-center flex-1 min-w-0 gap-1.5 sm:gap-3">
          {/* NEXT bus */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              NEXT
            </span>
            {isNextArriving ? (
              <div className="bg-[#0d785a] text-white px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm animate-pulse whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-80" />
                <span>Arriving</span>
              </div>
            ) : nextMins !== null ? (
              <div className="bg-[#f0f4f8] text-slate-800 px-3 py-1.5 rounded-xl font-medium text-sm flex items-baseline gap-1 border border-slate-100 whitespace-nowrap">
                <span className="font-extrabold text-base text-slate-900">{nextMins}</span>
                <span className="text-xs text-slate-500 font-medium">mins</span>
              </div>
            ) : (
              <div className="bg-[#f0f4f8] text-slate-400 px-3 py-1.5 rounded-xl font-medium text-sm border border-slate-100 whitespace-nowrap">
                -
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="pt-4 text-slate-300 shrink-0">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* 2ND BUS */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              2ND BUS
            </span>
            <div className="bg-[#f0f4f8] text-slate-800 px-3 py-1.5 rounded-xl font-medium text-sm flex items-baseline gap-1 border border-slate-100 whitespace-nowrap">
              {next2Mins !== null ? (
                <>
                  <span className="font-extrabold text-base text-slate-900">{next2Mins}</span>
                  <span className="text-xs text-slate-500 font-medium">mins</span>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-medium">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Bus Type (DD / SD) */}
        <div className="flex items-center shrink-0">
          <BusTypeBadge type={service.nextBus?.type || 'SD'} wheelchair={service.nextBus?.wheelchair} />
        </div>
      </div>
    </div>
  );
};
