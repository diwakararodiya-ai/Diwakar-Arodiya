export type SupportedLanguage = 
  | 'Hindi'
  | 'Kannada'
  | 'Marathi'
  | 'Telugu'
  | 'Tamil'
  | 'Bengali'
  | 'Gujarati'
  | 'Punjabi'
  | 'Malayalam'
  | 'Odia'
  | 'English';

export interface LocationItem {
  id: string;
  name: string;
  district?: string;
  state?: string;
  lat: number;
  lon: number;
  label?: string; // e.g. "Home", "Main Farm (खेत 1)", "South Orchard (खेत 2)"
  isGps?: boolean;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainProbability: number;
  rainMm: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  cloudCover: number;
  uvIndex: number;
  pressure: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  alert?: WeatherAlert;
  lastUpdated: string;
}

export interface HourlyItem {
  time: string;
  hourDisplay: string;
  temp: number;
  rainProbability: number;
  rainMm: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  spraySuitability: 'good' | 'moderate' | 'unsuitable';
  note?: string;
}

export interface DailyItem {
  date: string;
  dayDisplay: string;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  rainProbability: number;
  rainMm: number;
  windSpeedMax: number;
  windGustMax: number;
  windDirection: number;
  uvIndexMax: number;
  weatherCode: number;
  condition: string;
  sunrise: string;
  sunset: string;
  agriAlert?: string;
  irrigationAdvice: string;
}

export interface WeatherAlert {
  id: string;
  type: 'heavy_rain' | 'thunderstorm' | 'strong_wind' | 'heatwave' | 'coldwave' | 'drought_stress';
  severity: 'yellow' | 'orange' | 'red';
  title: string;
  description: string;
  actionableAdvice: string;
  source: string;
  issuedAt: string;
}

export interface CropProfile {
  id: string;
  name: string; // e.g. "Wheat", "Paddy", "Cotton"
  variety?: string;
  sowingDate?: string;
  growthStage: 'germination' | 'vegetative' | 'flowering' | 'grain_filling' | 'maturity_harvest';
  irrigationType: 'canal' | 'borewell_drip' | 'sprinkler' | 'rainfed';
  soilType: 'alluvial' | 'black_cotton' | 'red_loamy' | 'sandy';
  fieldName: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioText?: string;
  timestamp: string;
  followUpQuestions?: string[];
  agriculturalActionType?: 'irrigation' | 'spraying' | 'harvesting' | 'sowing' | 'protection' | 'general';
}

export interface AgriculturalIndex {
  sprayScore: number; // 0 - 100
  sprayStatus: 'ideal' | 'caution' | 'unsafe';
  sprayReason: string;
  irrigationStatus: 'withhold' | 'apply' | 'monitor';
  irrigationReason: string;
  heatColdStress: 'none' | 'moderate_heat' | 'extreme_heat' | 'frost_risk';
  harvestSuitability: 'favorable' | 'risky';
}

export interface AgriNewsItem {
  id: string;
  title: string;
  category: 'Mandi & MSP' | 'Government Scheme' | 'Weather & Agromet' | 'Crop Advisory' | 'Technology & Subsidies';
  categoryLocal?: string;
  summary: string;
  farmerTakeaway: string;
  publishedTime: string;
  sourceName: string;
  sourceUrl?: string;
  impactTag?: 'positive' | 'warning' | 'neutral';
  imageUrl?: string;
}

export interface RadarStationInfo {
  name: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'CALIBRATING';
  sweepFrequencyMinutes: number;
  lastSweepTime: number;
  lastSweepFormatted: string;
  rangeKm: number;
}

export interface RadarMetrics {
  reflectivityDbz: number;
  rainRateMmPerHour: number;
  intensityCategory: string;
  intensityLevel: 'clear' | 'light' | 'moderate' | 'heavy' | 'storm';
  cloudCoverPercent: number;
  nearestCellDistanceKm: number;
  nearestCellDirection: string;
  cellMovementSpeedKmH: number;
  spraySafetyStatus: 'SAFE' | 'CAUTION' | 'UNSAFE';
  harvestSafetyStatus: 'OPTIMAL' | 'MODERATE' | 'DELAY';
  advisory: string;
  advisoryHindi: string;
}

export interface UpcomingPrecipitationScanItem {
  time: string;
  probability: number;
  amountMm: number;
  intensity: string;
}

export interface RadarMapLayers {
  host: string;
  dopplerTileTemplate: string;
  satelliteTileTemplate: string;
  currentRadarFrame?: {
    time: number;
    path: string;
  };
  currentSatelliteFrame?: {
    time: number;
    path: string;
  };
  availablePastFrames: number;
}

export interface WeatherRadarApiResponse {
  success: boolean;
  station: RadarStationInfo;
  radarMetrics: RadarMetrics;
  upcomingPrecipitationScan: UpcomingPrecipitationScanItem[];
  mapLayers: RadarMapLayers;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  joinedAt?: string;
}

