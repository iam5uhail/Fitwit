import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeeklyChart({ currentSteps, theme }) {
  const chartHeight = 140;
  
  const data = [
    { day: 'Mon', steps: 6000 },
    { day: 'Tue', steps: 9500 },
    { day: 'Wed', steps: 5000 },
    { day: 'Thu', steps: 11000 },
    { day: 'Fri', steps: 3000 },
    { day: 'Sat', steps: currentSteps },
    { day: 'Sun', steps: 0 }
  ];

  const maxSteps = 12000;
  const goal = 10000;
  const goalY = chartHeight - (goal / maxSteps) * chartHeight;

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Goal Line */}
      <View style={[styles.goalLine, { top: goalY }]} />
      <View style={[styles.goalLabel, { top: goalY - 10 }]}>
        <Text style={styles.goalLabelText}>GOAL</Text>
      </View>

      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const height = (item.steps / maxSteps) * chartHeight;
          const isToday = index === 5;
          const isGoalMet = item.steps >= goal;
          
          let barColor = theme.surface2;
          if (isToday) barColor = theme.accent;
          else if (isGoalMet) barColor = theme.accentSoft;

          return (
            <View key={index} style={styles.barCol}>
              {isToday && (
                <Text style={[styles.activeBarLabel, { color: theme.ink }]}>
                  {item.steps.toLocaleString()}
                </Text>
              )}
              <View style={[styles.bar, { height: height, backgroundColor: barColor }]} />
              <Text style={[styles.dayText, isToday && { color: theme.accent, fontWeight: 'bold' }]}>
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    height: 170,
    marginTop: 10,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F4B84F', // Goal line is always sun token
    borderStyle: 'dashed',
    zIndex: 1,
  },
  goalLabel: {
    position: 'absolute',
    right: 0,
    backgroundColor: theme.surface,
    paddingLeft: 4,
    zIndex: 2,
  },
  goalLabelText: {
    color: '#F4B84F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingRight: 40, 
  },
  barCol: {
    alignItems: 'center',
    width: 38,
  },
  bar: {
    width: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeBarLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayText: {
    color: theme.muted,
    fontSize: 10,
  }
});
