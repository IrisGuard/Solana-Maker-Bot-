import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from '@/constants/colors';

interface TokenPriceChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  width?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  showYAxisLabel?: boolean;
}

export default function TokenPriceChart({
  data,
  labels,
  color = Colors.dark.accent,
  height = 200,
  width = Dimensions.get('window').width - 64,
  showLabels = true,
  showGrid = true,
  showYAxisLabel = false,
}: TokenPriceChartProps) {
  // Ensure we have data to display
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>Δεν υπάρχουν δεδομένα</Text>
      </View>
    );
  }

  // For web, we need to render a simpler version
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.webChartContainer}>
          <View style={styles.webChartHeader}>
            <Text style={styles.webChartTitle}>Τιμή SOL τελευταίες 7 ημέρες</Text>
          </View>
          <View style={styles.webChartContent}>
            <View style={styles.webChartLine}>
              {data.map((value, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.webChartPoint, 
                    { 
                      height: Math.max(5, (value / Math.max(...data)) * 100),
                      backgroundColor: color
                    }
                  ]} 
                />
              ))}
            </View>
            {showLabels && (
              <View style={styles.webChartLabels}>
                {labels.map((label, index) => (
                  <Text key={index} style={styles.webChartLabel}>{label}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // For native platforms, use LineChart
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: showLabels ? labels : [],
          datasets: [
            {
              data,
              color: () => color,
              strokeWidth: 2,
            },
          ],
        }}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: Colors.dark.cardBackground,
          backgroundGradientFrom: Colors.dark.cardBackground,
          backgroundGradientTo: Colors.dark.cardBackground,
          decimalPlaces: 2,
          color: () => color,
          labelColor: () => Colors.dark.secondaryText,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: color,
          },
          propsForBackgroundLines: {
            stroke: showGrid ? Colors.dark.border : 'transparent',
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        withHorizontalLabels={showYAxisLabel}
        withVerticalLabels={showLabels}
        withDots={true}
        withShadow={false}
        yAxisInterval={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 0,
  },
  noDataText: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
  },
  webChartContainer: {
    width: '100%',
    height: '100%',
    padding: 10,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
  },
  webChartHeader: {
    marginBottom: 10,
  },
  webChartTitle: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
  },
  webChartContent: {
    flex: 1,
  },
  webChartLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '80%',
    paddingBottom: 10,
  },
  webChartPoint: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  webChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  webChartLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 10,
    textAlign: 'center',
    width: 30,
  },
});