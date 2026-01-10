import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NutritionCardProps {
  title: string;
  value: number;
  unit: string;
  color: string;
  maxValue?: number;
  fullWidth?: boolean;
}

export default function NutritionCard({ title, value, unit, color, maxValue = 100, fullWidth = false }: NutritionCardProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: color }, fullWidth && styles.fullWidth]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <View style={styles.circleContainer}>
        <View style={[styles.circle, { opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 38,
    padding: 20,
    marginBottom: 15,
    minHeight: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  unit: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  circleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#545454ff',
  },
});
