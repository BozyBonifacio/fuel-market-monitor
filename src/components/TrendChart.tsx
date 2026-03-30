import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { FuelPoint, FuelProduct } from '../types/fuel';
import { formatPeriodLabel } from '../utils/format';

export function TrendChart({ points, product }: { points: FuelPoint[]; product: FuelProduct }) {
  const productPoints = useMemo(() => points.filter((item) => item.product === product), [points, product]);

  const [minValue, maxValue] = useMemo(() => {
    const values = productPoints.map((item) => item.value);
    return [Math.min(...values), Math.max(...values)];
  }, [productPoints]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product} trend</Text>
      <View style={styles.chart}>
        {productPoints.map((point) => {
          const range = maxValue - minValue || 0.1;
          const widthPercent = 35 + ((point.value - minValue) / range) * 65;
          return (
            <View key={`${product}-${point.period}`} style={styles.row}>
              <Text style={styles.period}>{formatPeriodLabel(point.period)}</Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${widthPercent}%` }]} />
              </View>
              <Text style={styles.value}>{point.value.toFixed(3)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    textTransform: 'capitalize'
  },
  chart: {
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  period: {
    width: 48,
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '600'
  },
  track: {
    flex: 1,
    height: 12,
    backgroundColor: colors.track,
    borderRadius: 999,
    overflow: 'hidden'
  },
  bar: {
    height: 12,
    backgroundColor: colors.accent,
    borderRadius: 999
  },
  value: {
    width: 58,
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700',
    fontSize: 12
  }
});
