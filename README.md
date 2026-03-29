<<<<<<< HEAD
# fuel-market-monitor
=======
# Fuel Market Monitor

A React Native + Expo starter application for monitoring fuel market prices on Android and iOS.

## Important reality check

You can develop this project from **Windows 10**, but Apple iOS binaries are not normally signed and produced fully locally on plain Windows. The practical path is:

1. develop on Windows 10 with Expo,
2. test Android/web locally,
3. generate the iOS build with **Expo EAS Build** in the cloud.

Expo documents EAS Build as a hosted service for building Android and iOS app binaries, including iOS `.ipa` files for distribution and testing. Flutter and Codemagic provide a similar cloud-build route for iOS. See Expo EAS Build docs and iOS build docs, plus Flutter iOS deployment and Codemagic docs for the same constraint pattern. 

## What this starter includes

- live-refreshing dashboard
- gasoline / diesel / premium snapshot cards
- trend chart
- pluggable data provider layer
- default mock mode for instant local startup
- optional live mode using the U.S. EIA API

## Data source options

### Included now: EIA market prices

The included adapter can call the U.S. Energy Information Administration API, which publishes petroleum and fuel price data. This is more of a market feed than a station-by-station retail feed.

### For true station-level "real-time" pricing

Replace `src/services/fuelService.ts` with a commercial provider or regional open-data API for your target country. Good choices depend heavily on geography and licensing.

## Run on Windows 10

### Prerequisites

- Node.js LTS
- npm
- Expo account
- Apple Developer account for App Store / TestFlight delivery

### Install

```bash
npm install
npx expo start
```

### Add a live API key

Create `.env`:

```bash
EXPO_PUBLIC_FUEL_API_KEY=your_eia_api_key_here
```

Or place it in Expo config `extra`.

## Build iOS from Windows 10

Install EAS CLI and sign in:

```bash
npm install -g eas-cli
npx eas login
```

Initialize build config if needed:

```bash
npx eas build:configure
```

Create the iOS build:

```bash
npx eas build --platform ios
```

For App Store submission:

```bash
npx eas submit --platform ios
```

## Files to customize

- `src/services/fuelService.ts` — swap or expand the fuel API
- `src/components/HomeScreen.tsx` — UI and feature layout
- `app.json` — bundle IDs, app name, permissions
- `eas.json` — build profiles

## Recommended production upgrades

- background fetch / push alerts for price spikes
- geofenced nearby stations
- local caching with SQLite
- historical analytics backend
- price anomaly detection
- map view of stations
- user watchlists by city or route
>>>>>>> 38c0264 (initial version)
