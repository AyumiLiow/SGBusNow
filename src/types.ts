export type BusType = 'SD' | 'DD' | 'BD'; // Single Decker, Double Decker, Bendy
export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing

export interface BusArrivalTiming {
  seconds: number; // Seconds until arrival
  load: BusLoad;
  type: BusType;
  wheelchair?: boolean;
}

export interface BusService {
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  destination: string;
  nextBus: BusArrivalTiming;
  nextBus2?: BusArrivalTiming;
  nextBus3?: BusArrivalTiming;
  firstBusTime?: string;
  lastBusTime?: string;
  frequencyMinutes?: string;
}

export interface BusStop {
  code: string;
  name: string;
  road: string;
  services: BusService[];
}
