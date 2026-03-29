export type FuelType = 'gasoline' | 'diesel' | 'premium';

export type FuelPricePoint = {
  timestamp: string;
  fuelType: FuelType;
  price: number;
  stationName: string;
  city: string;
  currency: string;
  lat?: number;
  lng?: number;
};

export type FuelApiConfig = {
  provider: 'mock' | 'eia';
  apiKey?: string;
  baseUrl?: string;
};

export type FuelSnapshot = {
  updatedAt: string;
  market: string;
  currency: string;
  points: FuelPricePoint[];
};
