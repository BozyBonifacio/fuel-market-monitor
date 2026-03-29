import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function PriceCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value.toFixed(3)}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border
  },
  label: {
    color: colors.subtext,
    fontSize: 13,
    textTransform: 'capitalize'
  },
  value: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 28,
    marginTop: 12
  },
  unit: {
    color: colors.subtext,
    marginTop: 4
  }
});
