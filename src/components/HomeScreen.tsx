import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFuelMonitor } from '../hooks/useFuelMonitor';
import { PriceCard } from './PriceCard';
import { TrendChart } from './TrendChart';
import { colors } from '../theme/colors';
import { FuelType } from '../types/fuel';

export function HomeScreen() {
  const { data, loading, error, summary, refresh, mode } = useFuelMonitor();

  const lastUpdated = useMemo(() => {
    if (!data?.updatedAt) return '—';
    return new Date(data.updatedAt).toLocaleString();
  }, [data?.updatedAt]);

  const selectedFuel: FuelType = 'gasoline';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Live fuel intelligence</Text>
            <Text style={styles.title}>Fuel Market Monitor</Text>
            <Text style={styles.subtitle}>Track gasoline, diesel, and premium prices with scheduled refresh.</Text>
          </View>
          <Pressable style={styles.badge} onPress={refresh}>
            <Text style={styles.badgeText}>{mode === 'eia' ? 'LIVE API' : 'MOCK MODE'}</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Market snapshot</Text>
          <Text style={styles.panelMeta}>Last updated: {lastUpdated}</Text>
          {loading && !data ? <ActivityIndicator size="large" /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.cardsRow}>
            {summary.map((item) => (
              <PriceCard key={item.fuelType} label={item.fuelType} value={item.price} unit={data?.currency ?? 'USD'} />
            ))}
          </View>
        </View>

        {data ? (
          <View style={styles.panel}>
            <TrendChart data={data} fuelType={selectedFuel} />
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Deployment notes</Text>
          <Text style={styles.note}>Use Expo on Windows 10 for development. Create the iOS .ipa with EAS cloud build.</Text>
          <Text style={styles.note}>Swap the service in src/services/fuelService.ts to your preferred commercial station-price API for country-specific feeds.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  eyebrow: { color: colors.accent, fontWeight: '700', marginBottom: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.subtext, maxWidth: 260, marginTop: 8, lineHeight: 20 },
  badge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999
  },
  badgeText: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10
  },
  panelTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  panelMeta: { color: colors.subtext },
  cardsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  error: { color: colors.danger },
  note: { color: colors.subtext, lineHeight: 20 }
});
