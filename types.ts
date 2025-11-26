
export interface AstroInput {
  city: string;
  state: string;
  country: string;
  date: string;
  time: string;
  temperature?: string;
  useHistoricalTemperature?: boolean;
  isCurrentLocation?: boolean;
}

export interface RealBirthdayObservation {
  location: string;
  date: string;
  time: string;
}

export interface AstroAnalysis {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  trueSolarTime: string;
  civilTimeDifference: string;
  sunPosition: {
    azimuth: number;
    altitude: number;
    constellation: string;
    longitude: number;
  };
  zodiacSign: string; // Strictly the Tropical Zodiac sign based on date
  moonPosition?: {
    phase: string;
    constellation: string;
  };
  planets?: Record<string, {
    longitude: number;
    zodiacSign: string;
    degree: number;
  }>;
  cosmicFact: string;
  equationOfTime: string;
  temperature: string;
  realBirthdayObservation?: RealBirthdayObservation;
  nextSolarReturn?: string; // When the sun returns to the exact birth longitude
  daysUntilSolarReturn?: number; // Days remaining until the next solar return
}

export interface BirthAnalysis extends AstroAnalysis {
  // Inherits all fields. 
  // Specific birth fields are now available in base to allow Current Observer to show them if relevant.
}

export interface PerfectAlignment {
  city: string;
  country: string;
  countryCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  reasoning: string;
  localDateAtReturn: string;
  localTimeAtReturn: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ArroyoAnalysis {
  scores: {
    Fire: number;
    Earth: number;
    Air: number;
    Water: number;
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
  positions: Record<string, {
    sign: string;
    longitude: number;
  }>;
  dominantElement: string;
  dominantModality: string;
  interpretation: string;
}