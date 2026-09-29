import React, { useState, useEffect, useRef } from 'react';
import { BusStop } from '../types';
import { MapPin, Clock } from 'lucide-react';

interface ActiveStopBannerProps {
  currentStop: BusStop;
  totalStops: number;
  lastUpdated: string;
  onOpenSelector: () => void;
  serviceCount: number;
  onSelectStopCode: (code: string, stopInfo?: { description: string; roadName: string }) => Promise<boolean | void> | void;
}

interface ShortlistedStop {
  stopCode: string;
  description: string;
  roadName: string;
}

export const ActiveStopBanner: React.FC<ActiveStopBannerProps> = ({
  currentStop,
  lastUpdated,
  serviceCount,
  onSelectStopCode,
}) => {
  const [inputCode, setInputCode] = useState<string>(currentStop.code);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [searchDesc, setSearchDesc] = useState<string>('');
  const [shortlistedStops, setShortlistedStops] = useState<ShortlistedStop[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchTimeoutRef = useRef<any>(null);

  // Sync input when active stop changes
  useEffect(() => {
    setInputCode(currentStop.code);
    setCodeError(null);
  }, [currentStop.code]);

  // Debounced search for bus stop description or road name
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchDesc.trim();
    if (!query) {
      setShortlistedStops([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stop?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          setShortlistedStops([]);
          return;
        }
        const data = await res.json();
        setShortlistedStops(Array.isArray(data?.stops) ? data.stops : []);
      } catch {
        setShortlistedStops([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchDesc]);

  // Form submit for 5-digit bus stop code
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim();
    if (!/^\d{5}$/.test(code)) {
      setCodeError('Code not found 😔 Please check 5-digit code again.');
      return;
    }
    setCodeError(null);
    const result = await onSelectStopCode(code);
    if (result === false) {
      setCodeError('Code not found 😔 Please check 5-digit code again.');
    }
  };

  // Clicking a shortlisted stop from description search
  const handleSelectShortlisted = (stop: ShortlistedStop) => {
    setInputCode(stop.stopCode);
    setCodeError(null);
    onSelectStopCode(stop.stopCode, {
      description: stop.description,
      roadName: stop.roadName,
    });
  };

  return (
    <div className="pt-2 pb-2">
      {/* Replicated Bus Stop Code & Description Search from catchmybusnew.vercel.app */}
      <section className="search-card mb-4" id="stop-search-card">
        {/* Bus Stop Code Form */}
        <form onSubmit={handleCodeSubmit}>
          <label htmlFor="bus-stop-code" className="input-label">
            Bus stop code
          </label>
          <div className="input-group">
            <input
              type="text"
              id="bus-stop-code"
              className="stop-code-input"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                if (codeError) setCodeError(null);
              }}
              placeholder="01039"
              maxLength={5}
              pattern="[0-9]{5}"
              inputMode="numeric"
              aria-label="5-digit bus stop code"
            />
            <button type="submit" className="primary-btn" id="show-buses-btn">
              Show buses
            </button>
          </div>
          {codeError && (
            <div
              id="bus-stop-code-error"
              className="w-full text-xs font-semibold text-rose-600 mt-2"
              role="alert"
            >
              {codeError}
            </div>
          )}
        </form>

        {/* Search by bus stop description or road name */}
        <div className="search-field-wrapper" style={{ marginTop: '16px' }}>
          <label htmlFor="search-stop-desc" className="input-label">
            Search by bus stop description or road name
          </label>
          <input
            type="text"
            id="search-stop-desc"
            className="search-desc-input"
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            placeholder="e.g. Orchard, Bugis, Victoria St..."
            aria-label="Search bus stops by description or road name"
          />
        </div>

        {/* Shortlisted Related Bus Stops List */}
        {searchDesc.trim().length > 0 && (
          <div className="shortlisted-stops-container" id="shortlisted-stops-container">
            <div className="shortlisted-heading">
              {isSearching
                ? 'Searching related bus stops…'
                : `Related Bus Stops (${shortlistedStops.length})`}
            </div>
            {shortlistedStops.length > 0 ? (
              <div
                className="shortlisted-stops-list"
                role="listbox"
                aria-label="Shortlisted bus stops"
              >
                {shortlistedStops.map((stop) => {
                  const isSelected = stop.stopCode === currentStop.code;
                  return (
                    <button
                      type="button"
                      key={stop.stopCode}
                      className={`shortlisted-stop-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectShortlisted(stop)}
                      id={`select-shortlisted-stop-${stop.stopCode}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="shortlisted-stop-info">
                        <span className="shortlisted-stop-desc">{stop.description}</span>
                        <span className="shortlisted-stop-road">{stop.roadName}</span>
                      </div>
                      <span className="shortlisted-badge">Stop {stop.stopCode}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              !isSearching && (
                <div className="shortlisted-empty-hint" id="no-shortlisted-stops-hint">
                  {/^\d+$/.test(searchDesc.trim())
                    ? 'Code not found 😔 Please check 5-digit code again.'
                    : `No matching bus stops found for “${searchDesc}”.`}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Current Active Stop Info Card */}
      <div className="bg-[#f2fbf7] border border-emerald-100 rounded-2xl p-3.5 mb-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#0d785a] text-white flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-[#0d785a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0">
                {currentStop.code}
              </span>
              <span className="text-xs font-semibold text-slate-600 truncate">
                {currentStop.road}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate">
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
