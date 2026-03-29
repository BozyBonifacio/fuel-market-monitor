import { useCallback, useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { getFuelSnapshot } from '../services/fuelService';
import { FuelSnapshot } from '../types/fuel';

const REFRESH_MS = 60000;

export function useFuelMonitor() {
  const [data, setData] = useState<FuelSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey =
    (Constants.expoConfig?.extra as { fuelApiKey?: string } | undefined)?.fuelApiKey ||
    process.env.EXPO_PUBLIC_FUEL_API_KEY;

  const provider = apiKey ? 'eia' : 'mock';

  const load = useCallback(async () => {
    try {
      setError(null);
      const snapshot = await getFuelSnapshot({ provider, apiKey }, 'US Retail Market');
      setData(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fuel prices');
    } finally {
      setLoading(false);
    }
  }, [apiKey, provider]);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const summary = useMemo(() => {
    if (!data) return [];
    const latestByType = new Map<string, number>();
    for (const point of data.points) {
      latestByType.set(point.fuelType, point.price);
    }
    return [...latestByType.entries()].map(([fuelType, price]) => ({ fuelType, price }));
  }, [data]);

  return { data, loading, error, summary, refresh: load, mode: provider };
}
