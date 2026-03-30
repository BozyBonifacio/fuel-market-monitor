import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { MARKETS } from '../constants/markets';
import { loadCachedSnapshot, loadPreferences, saveCachedSnapshot, savePreferences } from '../storage/preferences';
import { getFuelSnapshot } from '../services/fuelService';
import { AlertItem, AlertSettings, FuelSnapshot, MarketId } from '../types/fuel';

function pickNearestMarket(latitude: number, longitude: number): MarketId {
  if (latitude < 24 || latitude > 50 || longitude > -66 || longitude < -125) {
    return 'NUS';
  }
  if (latitude >= 32 && latitude <= 42 && longitude >= -124 && longitude <= -114) {
    return 'SCA';
  }
  if (longitude > -80) return 'R10';
  if (longitude > -97) return 'R20';
  if (longitude > -109) return 'R30';
  if (longitude > -116) return 'R40';
  return 'R50';
}

function latestValue(snapshot: FuelSnapshot | null, product: 'regular' | 'diesel') {
  if (!snapshot) return null;
  const matches = snapshot.points.filter((item) => item.product === product);
  return matches.length ? matches[matches.length - 1].value : null;
}

function buildAlerts(snapshot: FuelSnapshot | null, alertSettings: AlertSettings): AlertItem[] {
  if (!snapshot) return [];
  const regular = latestValue(snapshot, 'regular');
  const diesel = latestValue(snapshot, 'diesel');
  const alerts: AlertItem[] = [];

  if (regular !== null && regular >= alertSettings.regularAbove) {
    alerts.push({
      id: 'regular-spike',
      title: 'Regular gasoline above threshold',
      detail: `${snapshot.marketLabel} regular hit ${regular.toFixed(3)} USD/gal.`,
      severity: regular > alertSettings.regularAbove + 0.2 ? 'critical' : 'warning'
    });
  }

  if (diesel !== null && diesel >= alertSettings.dieselAbove) {
    alerts.push({
      id: 'diesel-spike',
      title: 'Diesel above threshold',
      detail: `${snapshot.marketLabel} diesel hit ${diesel.toFixed(3)} USD/gal.`,
      severity: diesel > alertSettings.dieselAbove + 0.25 ? 'critical' : 'warning'
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: 'healthy-market',
      title: 'No threshold breaches',
      detail: `All tracked fuels are below your configured thresholds in ${snapshot.marketLabel}.`,
      severity: 'info'
    });
  }

  return alerts;
}

export function useFuelMonitor() {
  const [snapshot, setSnapshot] = useState<FuelSnapshot | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<MarketId>('NUS');
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({ regularAbove: 3.75, dieselAbove: 4.1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_FUEL_API_KEY;

  useEffect(() => {
    loadPreferences().then((prefs) => {
      setSelectedMarketId(prefs.selectedMarketId);
      setAlertSettings(prefs.alertSettings);
    });
  }, []);

  const load = useCallback(
    async (marketId: MarketId, opts?: { silent?: boolean }) => {
      if (opts?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError(null);
        const next = await getFuelSnapshot(marketId, apiKey);
        setSnapshot(next);
        await saveCachedSnapshot(next);
      } catch (err) {
        const cached = await loadCachedSnapshot(marketId);
        if (cached) {
          setSnapshot({
            ...cached,
            provider: 'cache',
            stale: true,
            warning: 'Live feed unavailable. Showing the most recent cached snapshot.'
          });
        }
        setError(err instanceof Error ? err.message : 'Could not refresh fuel prices.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiKey]
  );

  useEffect(() => {
    load(selectedMarketId);
  }, [load, selectedMarketId]);

  const saveMarket = useCallback(
    async (marketId: MarketId) => {
      setSelectedMarketId(marketId);
      await savePreferences({ selectedMarketId: marketId, alertSettings });
    },
    [alertSettings]
  );

  const updateAlerts = useCallback(
    async (next: AlertSettings) => {
      setAlertSettings(next);
      await savePreferences({ selectedMarketId, alertSettings: next });
    },
    [selectedMarketId]
  );

  const detectNearestMarket = useCallback(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      throw new Error('Location permission was denied.');
    }

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const marketId = pickNearestMarket(position.coords.latitude, position.coords.longitude);
    await saveMarket(marketId);
    return marketId;
  }, [saveMarket]);

  const cards = useMemo(() => {
    if (!snapshot) return [];
    return ['regular', 'diesel', 'premium']
      .map((product) => {
        const matching = snapshot.points.filter((item) => item.product === product);
        const latest = matching.length ? matching[matching.length - 1] : null;
        if (!latest) return null;
        const previous = matching.length > 1 ? matching[matching.length - 2] : null;
        const delta = previous ? Number((latest.value - previous.value).toFixed(3)) : 0;
        return {
          product,
          value: latest.value,
          unit: latest.unit,
          delta
        };
      })
      .filter(Boolean) as Array<{ product: string; value: number; unit: string; delta: number }>;
  }, [snapshot]);

  const alerts = useMemo(() => buildAlerts(snapshot, alertSettings), [snapshot, alertSettings]);

  return {
    snapshot,
    selectedMarketId,
    selectedMarket: MARKETS.find((market) => market.id === selectedMarketId) ?? MARKETS[0],
    markets: MARKETS,
    cards,
    alerts,
    alertSettings,
    loading,
    refreshing,
    error,
    saveMarket,
    updateAlerts,
    refresh: () => load(selectedMarketId, { silent: true }),
    detectNearestMarket
  };
}
