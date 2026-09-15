import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BUS_STOPS_DATA } from './data/mockBusData';
import { BusStop, BusService } from './types';
import { Header } from './components/Header';
import { ActiveStopBanner } from './components/ActiveStopBanner';
import { BusCard } from './components/BusCard';
import { StopSelectorModal } from './components/StopSelectorModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import {
  Smartphone,
  Maximize2,
  SlidersHorizontal,
  Search,
  Filter,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // Current active bus stop (default to Bras Basah Green from the screenshot)
  const [stopsData, setStopsData] = useState<BusStop[]>(BUS_STOPS_DATA);
  const [currentStopCode, setCurrentStopCode] = useState<string>('04121');
  const [selectedService, setSelectedService] = useState<BusService | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>('mobile');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'DD' | 'SEATS' | 'FAV'>('ALL');
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(['04121', '08057']);
  const [favoriteServices, setFavoriteServices] = useState<string[]>(['7', '106']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timestamp formatted as "06:50:08 PM" matching screenshot
  const [lastUpdated, setLastUpdated] = useState<string>('06:50:08 PM');

  // Format timestamp helper
  const getFormattedTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, []);

  // Initialize clock on mount
  useEffect(() => {
    setLastUpdated(getFormattedTime());
  }, [getFormattedTime]);

  // Current active stop object
  const currentStop = useMemo(() => {
    return stopsData.find((s) => s.code === currentStopCode) || stopsData[0];
  }, [stopsData, currentStopCode]);

  // Live countdown timer: decrement seconds realistically
  useEffect(() => {
    const interval = setInterval(() => {
      setStopsData((prevStops) =>
        prevStops.map((stop) => ({
          ...stop,
          services: stop.services.map((srv) => {
            const nextSec = Math.max(0, srv.nextBus.seconds - 1);
            const next2Sec = Math.max(0, srv.nextBus2.seconds - 1);
            return {
              ...srv,
              nextBus: {
                ...srv.nextBus,
                seconds: nextSec,
              },
              nextBus2: {
                ...srv.nextBus2,
                seconds: next2Sec,
              },
            };
          }),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Refresh with subtle variation in arrival times
      setStopsData((prev) =>
        prev.map((stop) => ({
          ...stop,
          services: stop.services.map((srv) => {
            // slight jitter to simulate live telemetry
            const jitter = Math.floor(Math.random() * 30) - 10;
            return {
              ...srv,
              nextBus: {
                ...srv.nextBus,
                seconds: Math.max(10, srv.nextBus.seconds + jitter),
              },
              nextBus2: {
                ...srv.nextBus2,
                seconds: Math.max(180, srv.nextBus2.seconds + jitter),
              },
            };
          }),
        }))
      );
      setLastUpdated(getFormattedTime());
      setIsRefreshing(false);
      showToast('Arrival times refreshed');
    }, 600);
  }, [getFormattedTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleToggleFavoriteStop = (code: string) => {
    setFavoriteCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Filtered bus services
  const displayedServices = useMemo(() => {
    return currentStop.services.filter((srv) => {
      // Search text filter
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchesNo = srv.serviceNo.toLowerCase().includes(query);
        const matchesDest = srv.destination.toLowerCase().includes(query);
        if (!matchesNo && !matchesDest) return false;
      }

      // Filter tabs
      if (activeFilterTab === 'DD') {
        return srv.nextBus.type === 'DD';
      }
      if (activeFilterTab === 'SEATS') {
        return srv.nextBus.load === 'SEA';
      }
      if (activeFilterTab === 'FAV') {
        return favoriteServices.includes(srv.serviceNo);
      }
      return true;
    });
  }, [currentStop, searchFilter, activeFilterTab, favoriteServices]);

  return (
    <div className="min-h-screen bg-[#eef2f6] flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4 text-slate-800">
      {/* Top Controls Bar: View mode switcher & Legend hint */}
      <header className="w-full max-w-md flex items-center justify-between px-2 mb-3 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Singapore LTA Feed</span>
        </div>

        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xs border border-slate-200/80 p-0.5 rounded-full shadow-2xs">
          <button
            id="view-mode-mobile-btn"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-[#0d785a] text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mobile device mockup"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Phone</span>
          </button>
          <button
            id="view-mode-full-btn"
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              viewMode === 'full'
                ? 'bg-[#0d785a] text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Full width view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Fluid</span>
          </button>
        </div>
      </header>

      {/* Main Container: Exact Mobile Frame / Fluid Container */}
      <main
        id="busnow-app-container"
        className={`w-full bg-[#f8fafc] transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-[420px] rounded-[36px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] border-[9px] border-slate-300/80 overflow-hidden relative ring-1 ring-black/5'
            : 'max-w-2xl rounded-3xl shadow-lg border border-slate-200 overflow-hidden'
        }`}
      >
        {/* App Header */}
        <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* App Inner Body */}
        <div className="p-4 sm:p-5">
          {/* Active Stop & Selector */}
          <ActiveStopBanner
            currentStop={currentStop}
            totalStops={stopsData.length}
            lastUpdated={lastUpdated}
            onOpenSelector={() => setIsSelectorOpen(true)}
            serviceCount={currentStop.services.length}
          />

          {/* Quick Filter Row */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilterTab('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeFilterTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({currentStop.services.length})
            </button>
            <button
              onClick={() => setActiveFilterTab('SEATS')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeFilterTab === 'SEATS'
                  ? 'bg-[#0d785a] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Seats Available
            </button>
            <button
              onClick={() => setActiveFilterTab('DD')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeFilterTab === 'DD'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Double Decker (DD)
            </button>
          </div>

          {/* Bus Arrival Cards */}
          <div className="space-y-1">
            {displayedServices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm">No services match current filter</p>
                <button
                  onClick={() => setActiveFilterTab('ALL')}
                  className="mt-2 text-xs text-[#0d785a] font-bold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              displayedServices.map((service) => (
                <BusCard
                  key={service.serviceNo}
                  service={service}
                  onSelect={(srv) => setSelectedService(srv)}
                />
              ))
            )}
          </div>

          {/* Info Footer within the App */}
          <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tap any bus for route details & 3rd bus
            </span>
            <span>DD: Double Decker · SD: Single</span>
          </div>
        </div>
      </main>

      {/* Stop Selector Modal */}
      <StopSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        stops={stopsData}
        currentStopCode={currentStop.code}
        onSelectStop={(stop) => {
          setCurrentStopCode(stop.code);
          showToast(`Switched to ${stop.name}`);
        }}
        favoriteCodes={favoriteCodes}
        onToggleFavorite={handleToggleFavoriteStop}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        stopName={currentStop.name}
        stopRoad={currentStop.road}
        onClose={() => setSelectedService(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <aside
          id="toast-alert"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
