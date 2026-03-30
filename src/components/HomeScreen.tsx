import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useFuelMonitor } from '../hooks/useFuelMonitor';
import { colors } from '../theme/colors';
import { formatTimestamp } from '../utils/format';
import { PriceCard } from './PriceCard';
import { TrendChart } from './TrendChart';

export function HomeScreen() {
  const {
    snapshot,
    selectedMarket,
    selectedMarketId,
    markets,
    cards,
    alerts,
    alertSettings,
    loading,
    refreshing,
    error,
    saveMarket,
    updateAlerts,
    refresh,
    detectNearestMarket
  } = useFuelMonitor();
  const [geoError, setGeoError] = useState<string | null>(null);

  const trendProduct = useMemo(() => {
    if (cards.some((card) => card.product === 'regular')) return 'regular';
    return cards[0]?.product;
  }, [cards]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.eyebrow}>Production starter</Text>
            <Text style={styles.title}>Fuel Market Monitor</Text>
            <Text style={styles.subtitle}>
              Real-time U.S. fuel benchmark tracking with live EIA support, cached fallback, market switching, and in-app threshold alerts.
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeLabel}>{snapshot?.provider?.toUpperCase() ?? 'LOADING'}</Text>
            <Text style={styles.liveBadgeMeta}>{snapshot?.stale ? 'cached' : 'fresh'}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Market scope</Text>
              <Text style={styles.panelMeta}>{selectedMarket.label} · {selectedMarket.subtitle}</Text>
            </View>
            <Pressable
              style={styles.secondaryButton}
              onPress={async () => {
                try {
                  setGeoError(null);
                  await detectNearestMarket();
                } catch (err) {
                  setGeoError(err instanceof Error ? err.message : 'Unable to detect nearest market.');
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Use my location</Text>
            </Pressable>
          </View>

          <View style={styles.marketList}>
            {markets.map((market) => {
              const active = market.id === selectedMarketId;
              return (
                <Pressable
                  key={market.id}
                  style={[styles.marketChip, active && styles.marketChipActive]}
                  onPress={() => saveMarket(market.id)}
                >
                  <Text style={[styles.marketChipLabel, active && styles.marketChipLabelActive]}>{market.label}</Text>
                  <Text style={[styles.marketChipMeta, active && styles.marketChipMetaActive]}>{market.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>

          {geoError ? <Text style={styles.warningText}>{geoError}</Text> : null}
          {snapshot ? <Text style={styles.panelMeta}>Last successful refresh: {formatTimestamp(snapshot.updatedAt)}</Text> : null}
          {snapshot?.warning ? <Text style={styles.warningText}>{snapshot.warning}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Market snapshot</Text>
          {loading && !snapshot ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.panelMeta}>Loading price benchmarks…</Text>
            </View>
          ) : (
            <View style={styles.cardsWrap}>
              {cards.map((card) => (
                <PriceCard
                  key={card.product}
                  label={card.product}
                  value={card.value}
                  unit={card.unit}
                  delta={card.delta}
                />
              ))}
            </View>
          )}
        </View>

        {snapshot && trendProduct ? (
          <View style={styles.panel}>
            <TrendChart points={snapshot.points} product={trendProduct as 'regular' | 'diesel' | 'premium'} />
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Alert thresholds</Text>
          <Text style={styles.panelMeta}>Persisted on-device. Use these values to flag when market benchmarks move into watchlist territory.</Text>
          <View style={styles.formRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Regular gasoline threshold</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={String(alertSettings.regularAbove)}
                onChangeText={(text) =>
                  updateAlerts({
                    ...alertSettings,
                    regularAbove: Number(text || 0)
                  })
                }
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Diesel threshold</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={String(alertSettings.dieselAbove)}
                onChangeText={(text) =>
                  updateAlerts({
                    ...alertSettings,
                    dieselAbove: Number(text || 0)
                  })
                }
              />
            </View>
          </View>

          <View style={styles.alertList}>
            {alerts.map((alert) => (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  alert.severity === 'critical'
                    ? styles.alertCritical
                    : alert.severity === 'warning'
                      ? styles.alertWarning
                      : styles.alertInfo
                ]}
              >
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDetail}>{alert.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Production checklist</Text>
          <Text style={styles.checkItem}>• Replace the EIA feed with a licensed station-level API for your target geography.</Text>
          <Text style={styles.checkItem}>• Add auth, backend watchlists, and push notifications for threshold events.</Text>
          <Text style={styles.checkItem}>• Connect analytics and crash reporting before App Store release.</Text>
          <Text style={styles.checkItem}>• Update bundle identifiers, app icons, privacy details, and EAS signing.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    padding: 16,
    gap: 16
  },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  heroTextWrap: {
    flex: 1,
    gap: 6
  },
  eyebrow: {
    color: colors.heroAccent,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 12
  },
  title: {
    color: colors.heroText,
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.heroSubtext,
    lineHeight: 20,
    marginTop: 4
  },
  liveBadge: {
    backgroundColor: colors.heroCard,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 84,
    alignSelf: 'flex-start'
  },
  liveBadgeLabel: {
    color: colors.heroText,
    fontWeight: '800',
    textAlign: 'center'
  },
  liveBadgeMeta: {
    color: colors.heroSubtext,
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.6
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  panelTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20
  },
  panelMeta: {
    color: colors.subtext,
    lineHeight: 18
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: '700'
  },
  marketList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  marketChip: {
    width: '48%',
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  marketChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  marketChipLabel: {
    color: colors.text,
    fontWeight: '800'
  },
  marketChipLabelActive: {
    color: '#FFFFFF'
  },
  marketChipMeta: {
    color: colors.subtext,
    marginTop: 4,
    fontSize: 12
  },
  marketChipMetaActive: {
    color: '#DDE8FF'
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10
  },
  cardsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'
  },
  inputWrap: {
    flex: 1,
    minWidth: 150,
    gap: 6
  },
  inputLabel: {
    color: colors.subtext,
    fontWeight: '600'
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontWeight: '700'
  },
  alertList: {
    gap: 10
  },
  alertCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 4
  },
  alertCritical: {
    backgroundColor: '#FFF1F1',
    borderColor: '#F0B4B4'
  },
  alertWarning: {
    backgroundColor: '#FFF8EC',
    borderColor: '#F0D19A'
  },
  alertInfo: {
    backgroundColor: '#EEF7FF',
    borderColor: '#BED9F9'
  },
  alertTitle: {
    color: colors.text,
    fontWeight: '800'
  },
  alertDetail: {
    color: colors.subtext,
    lineHeight: 18
  },
  warningText: {
    color: colors.warning,
    lineHeight: 18
  },
  errorText: {
    color: colors.danger,
    lineHeight: 18
  },
  checkItem: {
    color: colors.subtext,
    lineHeight: 20
  }
});
