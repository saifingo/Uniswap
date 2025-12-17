import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PriceChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export const PriceChart = ({ data, labels, color = '#FF007A' }: PriceChartProps) => {
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels,
          datasets: [{
            data,
          }]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: () => color,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
});
