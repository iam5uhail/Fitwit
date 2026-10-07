import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CircularProgress from './CircularProgress';

export default function WalkingTracker({ onCardPress, globalSteps, setGlobalSteps }) {
  const [statusMsg, setStatusMsg] = useState('Checking Sensor...');
  const goal = 8000;

  const distanceKm = (globalSteps * 0.000762).toFixed(2);
  const kcal = (globalSteps * 0.04).toFixed(0);
  
  const totalSeconds = Math.floor(globalSteps * 0.55);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  useEffect(() => {
    let sub = null;
    let base = 0;

    const startPedometer = async () => {
      try {
        const saved = await AsyncStorage.getItem('@today_steps');
        if (saved) {
          base = parseInt(saved, 10);
          setGlobalSteps(base);
        }

        try {
          const { status } = await Pedometer.requestPermissionsAsync();
          if (status === 'granted' && await Pedometer.isAvailableAsync()) {
            setStatusMsg('Counting automatically');
            sub = Pedometer.watchStepCount(result => {
              const currentTotal = base + result.steps;
              setGlobalSteps(currentTotal);
              AsyncStorage.setItem('@today_steps', currentTotal.toString());
            });
            return;
          }
        } catch (e) {
          console.log('Official pedometer failed, falling back...');
        }

        setStatusMsg('Counting automatically');
        Accelerometer.setUpdateInterval(50);
        let currentTotal = base;
        let lastStepTime = Date.now();
        
        sub = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x*x + y*y + z*z);
          const now = Date.now();
          // Tuned threshold: 1.18 ignores casual phone lifting, but catches real footsteps.
          if (magnitude > 1.18 && now - lastStepTime > 450) {
            currentTotal += 1;
            lastStepTime = now;
            setGlobalSteps(currentTotal);
            AsyncStorage.setItem('@today_steps', currentTotal.toString());
          }
        });

      } catch (e) {
        setStatusMsg('Sensor Error');
      }
    };

    startPedometer();

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onCardPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeAuto}>
          <View style={styles.greenDot} />
          <Text style={styles.badgeAutoText}>{statusMsg}</Text>
        </View>
        <View style={styles.badgeGoal}>
          <Text style={styles.badgeGoalText}>Goal {goal.toLocaleString()}</Text>
        </View>
      </View>

      <CircularProgress steps={globalSteps} goal={goal} />

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{kcal}</Text>
          <Text style={styles.statLabel}>Calories (kcal)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🕒</Text>
          <Text style={styles.statValue}>{timeStr}</Text>
          <Text style={styles.statLabel}>Time (min:sec)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🛣️</Text>
          <Text style={styles.statValue}>{distanceKm}</Text>
          <Text style={styles.statLabel}>Distance (km)</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Tap card for weekly report {'>'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15201A',
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E2F26',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeAuto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B3426',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3DD589',
    marginRight: 8,
  },
  badgeAutoText: {
    color: '#3DD589',
    fontSize: 13,
    fontWeight: 'bold',
  },
  badgeGoal: {
    backgroundColor: '#1B2620',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeGoalText: {
    color: '#88A092',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1B2620',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 12,
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#88A092',
    fontSize: 11,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    color: '#88A092',
    fontSize: 14,
  },
});
