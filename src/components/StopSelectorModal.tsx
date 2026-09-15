import React, { useState, useMemo } from 'react';
import { BusStop } from '../types';
import { X, Search, MapPin, Check, Star } from 'lucide-react';

interface StopSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stops: BusStop[];
  currentStopCode: string;
  onSelectStop: (stop: BusStop) => void;
  favoriteCodes: string[];
  onToggleFavorite: (code: string) => void;
}

export const StopSelectorModal: React.FC<StopSelectorModalProps> = ({
  isOpen,
  onClose,
  stops,
  currentStopCode,
  onSelectStop,
  favoriteCodes,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return stops;
    const query = searchQuery.toLowerCase().trim();
    return stops.filter((stop) => {
      const matchCode = stop.code.toLowerCase().includes(query);
      const matchName = stop.name.toLowerCase().includes(query);
      const matchRoad = stop.road.toLowerCase().includes(query);
      const matchService = stop.services.some((s) =>
        s.serviceNo.toLowerCase().includes(query)
      );
      return matchCode || matchName || matchRoad || matchService;
    });
  }, [stops, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 transition-opacity">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0d785a] flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Select Bus Stop</h3>
              <p className="text-xs text-slate-400">
                {stops.length} bus stops available in Central SG
              </p>
            </div>
          </div>
          <button
            id="close-stop-selector-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-bus-stops-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by stop, road, code, or bus no..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0d785a] focus:ring-1 focus:ring-[#0d785a] placeholder:text-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Stops List */}
        <div className="overflow-y-auto p-3.5 space-y-2 divide-y divide-slate-50">
          {filteredStops.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No bus stops found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredStops.map((stop) => {
              const isSelected = stop.code === currentStopCode;
              const isFav = favoriteCodes.includes(stop.code);

              return (
                <div
                  key={stop.code}
                  id={`stop-item-${stop.code}`}
                  onClick={() => {
                    onSelectStop(stop);
                    onClose();
                  }}
                  className={`pt-2 first:pt-0 pb-2 px-3 rounded-xl flex items-start justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/70 border border-emerald-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                          isSelected
                            ? 'bg-[#0d785a] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {stop.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {stop.road}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {stop.name}
                    </div>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {stop.services.map((srv) => (
                        <span
                          key={srv.serviceNo}
                          className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs"
                        >
                          {srv.serviceNo}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(stop.code);
                      }}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400' : ''
                        }`}
                      />
                    </button>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0d785a] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
