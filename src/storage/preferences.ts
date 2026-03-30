import AsyncStorage from '@react-native-async-storage/async-storage';
import { FuelPreferences, FuelSnapshot, MarketId } from '../types/fuel';

const PREFERENCES_KEY = 'fuel-monitor/preferences';
const CACHE_PREFIX = 'fuel-monitor/cache/';

export const DEFAULT_PREFERENCES: FuelPreferences = {
  selectedMarketId: 'NUS',
  alertSettings: {
    regularAbove: 3.75,
    dieselAbove: 4.1
  }
};

export async function loadPreferences(): Promise<FuelPreferences> {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(raw),
      alertSettings: {
        ...DEFAULT_PREFERENCES.alertSettings,
        ...(JSON.parse(raw).alertSettings ?? {})
      }
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: FuelPreferences) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export async function loadCachedSnapshot(marketId: MarketId): Promise<FuelSnapshot | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${marketId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FuelSnapshot;
  } catch {
    return null;
  }
}

export async function saveCachedSnapshot(snapshot: FuelSnapshot) {
  await AsyncStorage.setItem(`${CACHE_PREFIX}${snapshot.marketId}`, JSON.stringify(snapshot));
}
