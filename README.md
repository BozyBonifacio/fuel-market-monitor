# Fuel Market Monitor — production starter

This is an upgraded Expo SDK 54 mobile app for monitoring U.S. fuel market benchmarks from Windows 10 and shipping to iOS with EAS cloud builds.

## What changed

This version turns the original demo into a production-oriented starter:

- Expo SDK 54 dependency set
- resilient EIA data adapter with market-specific series mapping
- cached fallback when live refresh fails
- persisted market selection and threshold settings
- location-based market auto-selection
- cleaner dashboard UI for iPhone and Android
- simpler trend visualization with no extra chart dependency
- honest production checklist for the work still needed before store release

## What this app does now

- tracks U.S. benchmark fuel markets
- supports these markets: U.S., East Coast, Midwest, Gulf Coast, Rocky Mountain, West Coast, California
- shows latest regular gasoline and diesel prices for all supported markets
- shows premium gasoline for the national benchmark where the configured EIA series is available
- stores the last successful snapshot locally so the app still shows useful data when the feed is unavailable
- lets users set watch thresholds for regular and diesel prices

## What it still is not

This is a **production starter**, not a fully finished commercial app.

To make it truly production-grade for retail users, you should still add:

- a licensed station-level fuel provider for your target country or market
- backend APIs for accounts, watchlists, and sync
- push notifications for threshold events
- analytics, crash reporting, and privacy disclosures
- final bundle identifiers, assets, and store metadata

## Current data source

The live mode uses the U.S. Energy Information Administration API. This is a market benchmark feed, not a real-time station-by-station retail feed.

Environment variable:

```bash
EXPO_PUBLIC_FUEL_API_KEY=your_eia_api_key_here
```

If no API key is present, the app runs in mock mode.

## Install on Windows 10

```bash
npm install
npx expo install --fix
npx expo start
```

If Expo Go on iPhone is your test target, stay on SDK 54 until Expo Go changes again.

## iOS build from Windows 10

```bash
npx eas login
npx eas build --platform ios
```

## Key files

- `src/services/fuelService.ts` — live and mock data provider
- `src/hooks/useFuelMonitor.ts` — state, caching, alerts, location logic
- `src/storage/preferences.ts` — AsyncStorage persistence
- `src/components/HomeScreen.tsx` — main production dashboard

## Recommended next engineering step

Swap the EIA benchmark adapter for your real station-price provider and add push notifications for user watchlists.
