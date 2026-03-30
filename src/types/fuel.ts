export type FuelProduct = 'regular' | 'diesel' | 'premium';

export type MarketId = 'NUS' | 'R10' | 'R20' | 'R30' | 'R40' | 'R50' | 'SCA';

export type MarketOption = {
  id: MarketId;
  label: string;
  subtitle: string;
};

export type FuelPoint = {
  period: string;
  isoDate: string;
  product: FuelProduct;
  value: number;
  unit: string;
};

export type FuelSnapshot = {
  marketId: MarketId;
  marketLabel: string;
  provider: 'eia' | 'mock' | 'cache';
  updatedAt: string;
  stale: boolean;
  points: FuelPoint[];
  warning?: string;
};

export type AlertSettings = {
  regularAbove: number;
  dieselAbove: number;
};

export type FuelPreferences = {
  selectedMarketId: MarketId;
  alertSettings: AlertSettings;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
};
