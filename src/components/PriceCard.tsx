import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function PriceCard({
  label,
  value,
  unit,
  delta
}: {
  label: string;
  value: number;
  unit: string;
  delta: number;
}) {
  const tone = delta > 0 ? colors.warning : delta < 0 ? colors.positive : colors.muted;
  const prefix = delta > 0 ? '+' : '';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value.toFixed(3)}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={[styles.delta, { color: tone }]}>{`${prefix}${delta.toFixed(3)} vs prior release`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minWidth: 150,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6
  },
  label: {
    color: colors.subtext,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  unit: {
    color: colors.subtext,
    fontSize: 12
  },
  delta: {
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4
  }
});
