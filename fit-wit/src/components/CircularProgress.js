import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircularProgress({ steps, goal, color }) {
  const size = 260;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progress = Math.min(steps / goal, 1);
  const strokeDashoffset = circumference - progress * circumference;
  
  const percentage = Math.floor((steps / goal) * 100);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke="rgba(255,255,255,0.05)"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground Progress Circle */}
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.innerContainer}>
        <Text style={styles.stepsLabel}>STEPS</Text>
        <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.ofGoalText}>of {goal.toLocaleString()} steps</Text>
        <Text style={[styles.percentageText, { color: color }]}>{percentage}% of daily goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  innerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsLabel: {
    color: '#88A092',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  stepsValue: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '800',
    marginBottom: 4,
  },
  ofGoalText: {
    color: '#88A092',
    fontSize: 16,
    marginBottom: 16,
  },
  percentageText: {
    color: '#3DD589',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
