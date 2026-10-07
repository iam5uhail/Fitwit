import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import WeeklyChart from './WeeklyChart';

export default function ReportView({ currentSteps }) {
  return (
    <ScrollView style={styles.container}>
      <WeeklyChart currentSteps={currentSteps} />

      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>History</Text>
      </View>

      <View style={styles.historyCard}>
        <View style={styles.historyRow}>
          <View>
            <Text style={styles.historySteps}>{currentSteps.toLocaleString()}</Text>
            <Text style={styles.historyDate}>Today</Text>
          </View>
          <View style={styles.historyStats}>
            <Text style={styles.historyStatValue}>{(currentSteps * 0.04).toFixed(0)}</Text>
            <Text style={styles.historyStatLabel}>Kcal</Text>
          </View>
          <View style={styles.historyStats}>
            <Text style={styles.historyStatValue}>{(currentSteps * 0.000762).toFixed(2)}</Text>
            <Text style={styles.historyStatLabel}>Km</Text>
          </View>
        </View>

        <View style={[styles.historyRow, { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1E2F26' }]}>
          <View>
            <Text style={styles.historySteps}>7,800</Text>
            <Text style={styles.historyDate}>Yesterday</Text>
          </View>
          <View style={styles.historyStats}>
            <Text style={styles.historyStatValue}>312</Text>
            <Text style={styles.historyStatLabel}>Kcal</Text>
          </View>
          <View style={styles.historyStats}>
            <Text style={styles.historyStatValue}>5.94</Text>
            <Text style={styles.historyStatLabel}>Km</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  timelineTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#15201A',
    borderRadius: 32,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#1E2F26',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySteps: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  historyDate: {
    color: '#88A092',
    fontSize: 13,
    marginTop: 4,
  },
  historyStats: {
    alignItems: 'center',
  },
  historyStatValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyStatLabel: {
    color: '#88A092',
    fontSize: 12,
    marginTop: 4,
  },
});
