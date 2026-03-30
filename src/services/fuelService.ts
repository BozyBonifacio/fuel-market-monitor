import { MARKETS } from '../constants/markets';
import { FuelPoint, FuelProduct, FuelSnapshot, MarketId } from '../types/fuel';

const SERIES_MAP: Record<MarketId, Partial<Record<FuelProduct, string>>> = {
  NUS: {
    regular: 'PET.EMM_EPMRU_PTE_NUS_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_NUS_DPG.W',
    premium: 'PET.EMM_EPMPU_PTE_NUS_DPG.W'
  },
  R10: {
    regular: 'PET.EMM_EPMRU_PTE_R10_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_R10_DPG.W'
  },
  R20: {
    regular: 'PET.EMM_EPMRU_PTE_R20_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_R20_DPG.W'
  },
  R30: {
    regular: 'PET.EMM_EPMRU_PTE_R30_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_R30_DPG.W'
  },
  R40: {
    regular: 'PET.EMM_EPMRU_PTE_R40_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_R40_DPG.W'
  },
  R50: {
    regular: 'PET.EMM_EPMRU_PTE_R50_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_R50_DPG.W'
  },
  SCA: {
    regular: 'PET.EMM_EPMRU_PTE_SCA_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_SCA_DPG.W'
  }
};

function marketLabel(marketId: MarketId) {
  return MARKETS.find((market) => market.id === marketId)?.label ?? marketId;
}

function parsePeriod(period: string) {
  if (/^\d{8}$/.test(period)) {
    const year = Number(period.slice(0, 4));
    const month = Number(period.slice(4, 6)) - 1;
    const day = Number(period.slice(6, 8));
    return new Date(Date.UTC(year, month, day)).toISOString();
  }
  return new Date().toISOString();
}

function createMockPoints(marketId: MarketId): FuelPoint[] {
  const baseByMarket: Record<MarketId, number> = {
    NUS: 3.38,
    R10: 3.46,
    R20: 3.28,
    R30: 3.11,
    R40: 3.41,
    R50: 4.04,
    SCA: 4.62
  };

  const products = SERIES_MAP[marketId].premium ? (['regular', 'diesel', 'premium'] as FuelProduct[]) : (['regular', 'diesel'] as FuelProduct[]);
  const periods = Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - index) * 7);
    return {
      period: date.toISOString().slice(0, 10).replace(/-/g, ''),
      isoDate: date.toISOString()
    };
  });

  return periods.flatMap(({ period, isoDate }, index) => {
    const regular = baseByMarket[marketId] + (index - 3) * 0.015;
    return products.map((product) => {
      const adjustment = product === 'diesel' ? 0.36 : product === 'premium' ? 0.58 : 0;
      return {
        period,
        isoDate,
        product,
        value: Number((regular + adjustment).toFixed(3)),
        unit: 'USD/gal'
      };
    });
  });
}

type EiaRow = {
  period: string;
  value: number | string;
  units?: string;
};

async function fetchSeries(seriesId: string, apiKey: string): Promise<EiaRow[]> {
  const url = `https://api.eia.gov/v2/seriesid/${seriesId}?api_key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`EIA request failed with status ${response.status}`);
  }

  const json = (await response.json()) as {
    response?: { data?: EiaRow[] };
  };

  const rows = json.response?.data ?? [];
  if (!rows.length) {
    throw new Error(`No EIA data returned for ${seriesId}`);
  }

  return rows;
}

export async function getFuelSnapshot(marketId: MarketId, apiKey?: string): Promise<FuelSnapshot> {
  const label = marketLabel(marketId);

  if (!apiKey) {
    return {
      marketId,
      marketLabel: label,
      provider: 'mock',
      updatedAt: new Date().toISOString(),
      stale: false,
      warning: 'Running in mock mode. Add EXPO_PUBLIC_FUEL_API_KEY to enable live EIA market data.',
      points: createMockPoints(marketId)
    };
  }

  const entries = Object.entries(SERIES_MAP[marketId]) as [FuelProduct, string][];
  const datasets = await Promise.all(
    entries.map(async ([product, seriesId]) => {
      const rows = await fetchSeries(seriesId, apiKey);
      const points: FuelPoint[] = rows
        .slice(0, 8)
        .reverse()
        .map((row) => ({
          period: row.period,
          isoDate: parsePeriod(row.period),
          product,
          value: Number(row.value),
          unit: row.units ?? 'USD/gal'
        }));

      return points;
    })
  );

  return {
    marketId,
    marketLabel: label,
    provider: 'eia',
    updatedAt: new Date().toISOString(),
    stale: false,
    points: datasets.flat()
  };
}
