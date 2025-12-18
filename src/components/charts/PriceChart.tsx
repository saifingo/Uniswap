import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PriceChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export const PriceChart = ({ data, labels, color = '#FF007A' }: PriceChartProps) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Reanimated.View style={[styles.container, animatedStyle]}>
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
    </Reanimated.View>
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
