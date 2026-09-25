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
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Clock,
  RefreshCw
} from 'lucide-react';

export type FetchStatus = 'loading' | 'empty' | 'refused' | 'unreachable' | 'success';

export default function App() {
  // Current active bus stop (default to Bras Basah Green 04121 from the screenshot)
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

  // Live fetch status state
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('loading');
  const [statusSentence, setStatusSentence] = useState<string>(
    'Fetching live bus arrival timings from Singapore Land Transport Authority...'
  );

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

  // Live arrival fetcher from serverless function
  const fetchLiveArrivals = useCallback(async (stopCode: string) => {
    setFetchStatus('loading');
    setStatusSentence('Fetching live bus arrival timings from Singapore Land Transport Authority...');

    try {
      const response = await fetch(`/api/bus?BusStopCode=${encodeURIComponent(stopCode)}`);

      if (response.status === 502 || response.status === 504) {
        setFetchStatus('unreachable');
        setStatusSentence('The upstream transport service is unreachable; please check your network connection.');
        return;
      }

      if (!response.ok) {
        // Upstream refused (e.g. 401, 403, 503 missing credential)
        setFetchStatus('refused');
        setStatusSentence('The upstream transport service refused the request; please verify your API credentials.');
        return;
      }

      const data = await response.json();
      const rawServices = data.Services || data.services || [];

      if (rawServices.length === 0) {
        setFetchStatus('empty');
        setStatusSentence('No buses are currently running for this stop.');
        setStopsData((prevStops) =>
          prevStops.map((stop) =>
            stop.code === stopCode ? { ...stop, services: [] } : stop
          )
        );
      } else {
        setFetchStatus('success');
        setStatusSentence('');
        // Merge incoming live services with existing bus stop definitions
        setStopsData((prevStops) =>
          prevStops.map((stop) => {
            if (stop.code === stopCode) {
              return {
                ...stop,
                services: rawServices.map((liveSrv: any) => {
                  const srvNo = liveSrv.ServiceNo || liveSrv.serviceNo;
                  const existing = stop.services.find((x) => x.serviceNo === srvNo);

                  const parseBusTiming = (bus: any) => {
                    if (!bus) return undefined;
                    const mins = typeof bus.minutes === 'number' ? bus.minutes : 0;
                    const secs = typeof bus.seconds === 'number' ? bus.seconds : mins * 60;
                    return {
                      seconds: Math.max(0, secs),
                      load: (bus.load === 'LSD' ? 'LSD' : bus.load === 'SDA' ? 'SDA' : 'SEA') as any,
                      type: (bus.type === 'DD' ? 'DD' : bus.type === 'BD' ? 'BD' : 'SD') as any,
                      wheelchair: true,
                    };
                  };

                  const nextBus = parseBusTiming(liveSrv.nextBus) || {
                    seconds: 0,
                    load: 'SEA',
                    type: 'SD',
                    wheelchair: true,
                  };

                  const nextBus2 = parseBusTiming(liveSrv.nextBus2);

                  return {
                    serviceNo: srvNo,
                    operator: liveSrv.operator || existing?.operator || 'SBST',
                    destination: existing?.destination || 'Loop / Terminal',
                    nextBus,
                    ...(nextBus2 ? { nextBus2 } : {}),
                    ...(liveSrv.nextBus3 ? { nextBus3: parseBusTiming(liveSrv.nextBus3) } : {}),
                    firstBusTime: existing?.firstBusTime || '05:30 AM',
                    lastBusTime: existing?.lastBusTime || '11:45 PM',
                    frequencyMinutes: existing?.frequencyMinutes || '8-12 mins',
                  };
                }),
              };
            }
            return stop;
          })
        );
      }
      setLastUpdated(getFormattedTime());
    } catch (err) {
      // Network failure reaching api or upstream
      setFetchStatus('unreachable');
      setStatusSentence('The upstream transport service is unreachable; please check your network connection.');
    } finally {
      setIsRefreshing(false);
    }
  }, [getFormattedTime]);

  // Fetch live arrivals whenever stopCode changes and automatically refresh every 20 seconds
  useEffect(() => {
    fetchLiveArrivals(currentStopCode);
    const interval = setInterval(() => {
      fetchLiveArrivals(currentStopCode);
    }, 20000);
    return () => clearInterval(interval);
  }, [currentStopCode, fetchLiveArrivals]);

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
    fetchLiveArrivals(currentStopCode);
    showToast('Refreshing live arrivals...');
  }, [currentStopCode, fetchLiveArrivals]);

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

          {/* Four Specific UI State Messages (loading, empty, refused, unreachable) */}
          {fetchStatus === 'loading' && (
            <div
              id="status-loading-banner"
              className="bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl p-4 mb-3.5 flex items-center gap-3 text-xs sm:text-sm shadow-2xs"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-ping shrink-0" />
              <span className="font-semibold">
                Fetching live bus arrival timings from Singapore Land Transport Authority...
              </span>
            </div>
          )}

          {fetchStatus === 'refused' && (
            <div
              id="status-refused-banner"
              className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-3.5 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs sm:text-sm">
                    The upstream transport service refused the request; please verify your API credentials.
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">LTA_ACCOUNT_KEY</code> in your deployment environment.
                  </p>
                </div>
                <button
                  onClick={() => fetchLiveArrivals(currentStopCode)}
                  className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2.5 py-1 rounded-lg cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {fetchStatus === 'unreachable' && (
            <div
              id="status-unreachable-banner"
              className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 mb-3.5 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs sm:text-sm">
                    The upstream transport service is unreachable; please check your network connection.
                  </p>
                </div>
                <button
                  onClick={() => fetchLiveArrivals(currentStopCode)}
                  className="text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 font-bold px-2.5 py-1 rounded-lg cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {fetchStatus === 'empty' && (
            <div
              id="status-empty-card"
              className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-600 mb-3.5 shadow-2xs"
            >
              <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm">
                No buses are currently running for this stop.
              </p>
            </div>
          )}

          {/* Bus Arrival Cards */}
          <div className="space-y-1">
            {displayedServices.length === 0 && fetchStatus !== 'empty' ? (
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

      {/* Required Attribution Footer for Singapore Open Data Licence */}
      <footer id="licence-attribution-footer" className="w-full max-w-md mt-4 mb-2 text-center text-[11px] text-slate-500 leading-relaxed px-4">
        <p>
          Contains information from{' '}
          <a
            href="https://datamall.lta.gov.sg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-800 font-medium"
          >
            LTA DataMall Bus Arrival
          </a>
          , accessed 25 September 2026, made available under the terms of the{' '}
          <a
            href="https://data.gov.sg/open-data-licence"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-800 font-medium"
          >
            Singapore Open Data Licence version 1.0
          </a>
          ,{' '}
          <a
            href="https://data.gov.sg/open-data-licence"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-800 font-medium"
          >
            data.gov.sg/open-data-licence
          </a>
          .
        </p>
      </footer>

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

