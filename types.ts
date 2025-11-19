export interface AstroInput {
  city: string;
  state: string;
  country: string;
  date: string;
  time: string;
  isCurrentLocation?: boolean;
}

export interface RealBirthdayObservation {
  location: string;
  date: string;
  time: string;
}

export interface AstroAnalysis {
  trueSolarTime: string;
  civilTimeDifference: string;
  sunPosition: {
    azimuth: number;
    altitude: number;
    constellation: string;
    longitude: number;
  };
  moonPosition?: {
    phase: string;
    constellation: string;
  };
  cosmicFact: string;
  equationOfTime: string;
  realBirthdayObservation?: RealBirthdayObservation;
}

export interface BirthAnalysis extends AstroAnalysis {
  nextSolarReturn: string; // When the sun returns to the exact birth longitude
  daysUntilSolarReturn: number;
}

export interface PerfectAlignment {
  city: string;
  country: string;
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