import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FuelSnapshot, FuelType } from '../types/fuel';

export function TrendChart({ data, fuelType }: { data: FuelSnapshot; fuelType: FuelType }) {
  const screenWidth = Dimensions.get('window').width;

  const chartData = useMemo(() => {
    const filtered = data.points.filter((point) => point.fuelType === fuelType);
    return {
      labels: filtered.map((_, idx) => `${idx + 1}`),
      datasets: [{ data: filtered.map((item) => item.price) }]
    };
  }, [data, fuelType]);

  return (
    <View>
      <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8, textTransform: 'capitalize' }}>
        {fuelType} trend
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 3,
          color: (opacity = 1) => `rgba(15, 98, 254, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(16, 36, 62, ${opacity})`,
          propsForDots: { r: '4', strokeWidth: '1' }
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
