import { FuelApiConfig, FuelSnapshot, FuelType } from '../types/fuel';

const EIA_SERIES: Record<FuelType, string> = {
  gasoline: 'PET.EMM_EPMRU_PTE_NUS_DPG.W',
  diesel: 'PET.EMD_EPD2D_PTE_NUS_DPG.W',
  premium: 'PET.EMM_EPMPU_PTE_NUS_DPG.W'
};

function recentTimestamps(count: number): string[] {
  const values: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    values.push(date.toISOString());
  }
  return values;
}

function buildMockSnapshot(market: string): FuelSnapshot {
  const timestamps = recentTimestamps(12);
  const points = timestamps.flatMap((timestamp, idx) => {
    const base = 3.25 + idx * 0.01;
    return [
      {
        timestamp,
        fuelType: 'gasoline' as const,
        price: Number((base + 0.02).toFixed(3)),
        stationName: 'City Fuel Hub',
        city: market,
        currency: 'USD'
      },
      {
        timestamp,
        fuelType: 'diesel' as const,
        price: Number((base - 0.03).toFixed(3)),
        stationName: 'Metro Diesel Center',
        city: market,
        currency: 'USD'
      },
      {
        timestamp,
        fuelType: 'premium' as const,
        price: Number((base + 0.24).toFixed(3)),
        stationName: 'Premium One',
        city: market,
        currency: 'USD'
      }
    ];
  });

  return {
    updatedAt: new Date().toISOString(),
    market,
    currency: 'USD',
    points
  };
}

async function fetchEiaSeries(seriesId: string, apiKey: string): Promise<number | null> {
  const url = `https://api.eia.gov/v2/seriesid/${seriesId}?api_key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`EIA request failed with status ${response.status}`);
  }
  const json = await response.json();
  const value = json?.response?.data?.[0]?.value;
  return typeof value === 'number' ? value : Number(value ?? NaN);
}

export async function getFuelSnapshot(config: FuelApiConfig, market = 'United States'): Promise<FuelSnapshot> {
  if (config.provider === 'eia' && config.apiKey) {
    const [gasoline, diesel, premium] = await Promise.all([
      fetchEiaSeries(EIA_SERIES.gasoline, config.apiKey),
      fetchEiaSeries(EIA_SERIES.diesel, config.apiKey),
      fetchEiaSeries(EIA_SERIES.premium, config.apiKey)
    ]);

    const timestamps = recentTimestamps(12);
    const buildSeries = (fuelType: FuelType, latest: number) =>
      timestamps.map((timestamp, idx) => ({
        timestamp,
        fuelType,
        price: Number((latest + (idx - 6) * 0.01).toFixed(3)),
        stationName: 'National Market Feed',
        city: market,
        currency: 'USD'
      }));

    return {
      updatedAt: new Date().toISOString(),
      market,
      currency: 'USD',
      points: [
        ...buildSeries('gasoline', gasoline ?? 0),
        ...buildSeries('diesel', diesel ?? 0),
        ...buildSeries('premium', premium ?? 0)
      ]
    };
  }

  return buildMockSnapshot(market);
}
