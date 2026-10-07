import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TimerTracker({ title, icon, color }) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const kcal = (seconds / 60 * 7).toFixed(1); // Rough estimate: 7 kcal per minute of intense activity

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{icon} {title}</Text>
        <TouchableOpacity 
          style={[styles.toggleBtn, isActive ? { backgroundColor: color } : styles.toggleBtnInactive]}
          onPress={toggleTimer}
        >
          <Text style={styles.toggleBtnText}>{isActive ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.timeValue}>{formatTime(seconds)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: color }]}>{kcal}</Text>
          <Text style={styles.statLabel}>Est. Kcal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnInactive: {
    backgroundColor: '#2C2C2E',
  },
  toggleBtnText: {
    color: '#FFF',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  timeValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});
