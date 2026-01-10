import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CaloriesCardProps {
  type: 'left' | 'burnt';
  calories: number;
  required?: number;
  color: string;
}

export default function CaloriesCard({ type, calories, required, color }: CaloriesCardProps) {
  const percentage = required ? (calories / required) * 100 : 0;
  const radius = 90;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.title}>
        {type === 'left' ? 'Calories left' : 'Calories Burnt'}
      </Text>
      
      <View style={styles.circleContainer}>
        <Svg height={radius * 2} width={radius * 2}>
          {/* Background circle */}
          <Circle
            stroke="rgba(0, 0, 0, 0.1)"
            fill="none"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          {required && (
            <Circle
              stroke="rgba(0, 0, 0, 0.3)"
              fill="none"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          )}
        </Svg>
        <View style={styles.caloriesTextContainer}>
          <Text style={styles.caloriesValue}>{calories}</Text>
        </View>
      </View>

      {required && (
        <Text style={styles.requiredText}>{required} Cals required</Text>
      )}
      {!required && (
        <Text style={styles.requiredText}>Cals</Text>
      )}

      {/* Decorative circle */}
      <View style={styles.decorativeCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 54,
    padding: 32,
    marginBottom: 15,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  caloriesTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesValue: {
    fontSize: 52,
    fontWeight: '700',
    color: '#000',
  },
  requiredText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
  },
  decorativeCircle: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
