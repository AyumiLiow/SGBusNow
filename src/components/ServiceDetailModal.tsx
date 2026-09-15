import React, { useState } from 'react';
import { BusService } from '../types';
import { X, Clock, MapPin, Accessibility, Bell, Check, AlertCircle, Info, Compass } from 'lucide-react';
import { BusTypeBadge } from './BusTypeBadge';

interface ServiceDetailModalProps {
  service: BusService | null;
  stopName: string;
  stopRoad: string;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  stopName,
  stopRoad,
  onClose,
}) => {
  const [alertSet, setAlertSet] = useState(false);

  if (!service) return null;

  const getMins = (seconds: number) => Math.max(0, Math.round(seconds / 60));

  const operatorNames: Record<string, string> = {
    SBST: 'SBS Transit',
    SMRT: 'SMRT Buses',
    TTS: 'Tower Transit Singapore',
    GAS: 'Go-Ahead Singapore',
  };

  const getLoadBadge = (load: string) => {
    switch (load) {
      case 'SEA':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d785a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 stroke-[3]" /> Seats Available
          </span>
        );
      case 'SDA':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d785a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 stroke-[3]" /> Standing Available
          </span>
        );
      case 'LSD':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> Limited Standing
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 transition-opacity">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#0d785a] text-white p-5 relative">
          <button
            id="close-service-detail-btn"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-16 h-14 bg-[#0d1624] rounded-2xl flex items-center justify-center shadow-md border border-white/15">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {service.serviceNo}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/25 text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-none border border-white/20">
                  {operatorNames[service.operator] || service.operator}
                </span>
                <span className="text-emerald-100 text-xs font-medium flex items-center gap-1">
                  <Accessibility className="w-3.5 h-3.5" /> WAB
                </span>
              </div>
              <div className="flex items-center gap-1 text-white text-sm font-semibold">
                <Compass className="w-3.5 h-3.5 text-emerald-200" />
                <span>Towards {service.destination}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Current location context */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-[#0d785a] shrink-0" />
            <span>
              Departing from <strong className="text-slate-800">{stopName}</strong> ({stopRoad})
            </span>
          </div>

          {/* Upcoming 3 Buses Sequence */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              UPCOMING BUSES
            </div>

            <div className="space-y-2">
              {/* Bus 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0d785a] text-white flex items-center justify-center font-bold text-xs">
                    1st
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      {service.nextBus.seconds <= 45 ? (
                        <span className="text-[#0d785a] font-extrabold animate-pulse">
                          Arriving at stop now
                        </span>
                      ) : (
                        `In ${getMins(service.nextBus.seconds)} minutes`
                      )}
                    </div>
                    <div className="mt-0.5">{getLoadBadge(service.nextBus.load)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <BusTypeBadge type={service.nextBus.type} wheelchair={service.nextBus.wheelchair} />
                </div>
              </div>

              {/* Bus 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    2nd
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      In {getMins(service.nextBus2.seconds)} minutes
                    </div>
                    <div className="mt-0.5">{getLoadBadge(service.nextBus2.load)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <BusTypeBadge type={service.nextBus2.type} wheelchair={service.nextBus2.wheelchair} />
                </div>
              </div>

              {/* Bus 3 */}
              {service.nextBus3 && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      3rd
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        In {getMins(service.nextBus3.seconds)} minutes
                      </div>
                      <div className="mt-0.5">{getLoadBadge(service.nextBus3.load)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <BusTypeBadge type={service.nextBus3.type} wheelchair={service.nextBus3.wheelchair} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Schedule Info */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d785a]">
              <Clock className="w-3.5 h-3.5" />
              <span>Service Operating Hours</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                First bus:{' '}
                <strong className="text-slate-800">{service.firstBusTime || '05:45 AM'}</strong>
              </div>
              <div>
                Last bus:{' '}
                <strong className="text-slate-800">{service.lastBusTime || '23:45 PM'}</strong>
              </div>
              <div className="col-span-2">
                Frequency:{' '}
                <strong className="text-slate-800">{service.frequencyMinutes || '8 - 12 mins'}</strong>
              </div>
            </div>
          </div>

          {/* Action button: Set Arrival Alert */}
          <button
            id="set-arrival-alert-btn"
            onClick={() => setAlertSet(!alertSet)}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              alertSet
                ? 'bg-emerald-100 text-[#0d785a] border border-emerald-300'
                : 'bg-[#0d785a] hover:bg-[#0b654c] text-white shadow-sm'
            }`}
          >
            <Bell className={`w-4 h-4 ${alertSet ? 'fill-emerald-600' : ''}`} />
            <span>
              {alertSet
                ? 'Arrival Alert Active (2 mins before)'
                : 'Notify Me Before Bus Arrives'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
