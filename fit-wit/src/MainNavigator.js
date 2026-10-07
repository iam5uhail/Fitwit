import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomTabs from './components/BottomTabs';
import HomeScreen from './screens/HomeScreen';
import GoalsScreen from './screens/GoalsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MonthlyReportScreen from './screens/MonthlyReportScreen';
import { IconProfile } from './components/Icons';
import { ThemeContext } from './theme/ThemeContext';
import { API_URL } from './config';

const { width } = Dimensions.get('window');
const TABS = ['Home', 'MonthlyReport', 'Goals', 'Profile'];

export default function MainNavigator() {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Home');
  const [globalSteps, setGlobalSteps] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Checking...');
  const [dailyGoal, setDailyGoal] = useState(8000);
  const [monthlyGoal, setMonthlyGoal] = useState(250000);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastSyncedSteps, setLastSyncedSteps] = useState(-1);

  useEffect(() => {
    const checkLogin = async () => {
      const email = await AsyncStorage.getItem('@user_email');
      setIsLoggedIn(!!email);
    };
    checkLogin();
  }, [activeTab]);

  // Sync steps to backend periodically
  useEffect(() => {
    const syncSteps = async () => {
      const email = await AsyncStorage.getItem('@user_email');
      if (!email || globalSteps === lastSyncedSteps || globalSteps === 0) return;

      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      try {
        const res = await fetch(`${API_URL}/steps/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, date: dateStr, steps: globalSteps, goal: dailyGoal })
        });
        if (res.ok) {
          setLastSyncedSteps(globalSteps);
        }
      } catch (err) {
        console.log("Sync error:", err);
      }
    };

    // Run sync check every 15 seconds
    const interval = setInterval(syncSteps, 15000);
    return () => clearInterval(interval);
  }, [globalSteps, lastSyncedSteps, dailyGoal]);

  // ... (keep the rest unchanged until render)
  useEffect(() => {
    let sub = null;
    let base = 0;

    const startPedometer = async () => {
      try {
        let currentTotal = 0;

        const savedSteps = await AsyncStorage.getItem('@today_steps');
        if (savedSteps) currentTotal = parseInt(savedSteps, 10);

        const savedGoal = await AsyncStorage.getItem('@daily_goal');
        if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));

        const savedMonthlyGoal = await AsyncStorage.getItem('@monthly_goal');
        if (savedMonthlyGoal) setMonthlyGoal(parseInt(savedMonthlyGoal, 10));

        // 1. Try to get the highly accurate historical steps from the OS
        try {
          const { status } = await Pedometer.requestPermissionsAsync();
          if (status === 'granted' && await Pedometer.isAvailableAsync()) {
            setStatusMsg('Syncing background steps...');
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const pastSteps = await Pedometer.getStepCountAsync(start, end);
            if (pastSteps && pastSteps.steps > currentTotal) {
              currentTotal = pastSteps.steps;
              setGlobalSteps(currentTotal);
              AsyncStorage.setItem('@today_steps', currentTotal.toString());
            }
          }
        } catch (e) {
          console.log("Could not fetch official steps", e);
        }

        // 2. Use the Accelerometer for INSTANT live counting (solves the standalone app bug!)
        setStatusMsg('Live Counting Active');
        Accelerometer.setUpdateInterval(30);

        let lastStepTime = Date.now();
        base = currentTotal;

        sub = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();

          // Threshold 1.18 and 400ms to reduce false steps (less sensitive)
          if (magnitude > 1.11 && now - lastStepTime > 400) {
            lastStepTime = now;
            base += 1;
            setGlobalSteps(base);
            AsyncStorage.setItem('@today_steps', base.toString());
          }
        });
      } catch (e) {
        setStatusMsg('Sensor Error');
      }
    };

    startPedometer();
    return () => sub && sub.remove();
  }, []);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    const index = TABS.indexOf(activeTab);
    if (scrollViewRef.current && index >= 0) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  }, [activeTab]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (TABS[index] && TABS[index] !== activeTab) {
      setActiveTab(TABS[index]);
    }
  };

  const renderTabContent = (tab) => {
    if (['MonthlyReport', 'Goals'].includes(tab) && !isLoggedIn) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <IconProfile color={theme.accent} size={64} />
          <Text style={{ color: theme.ink, fontSize: 28, fontWeight: 'bold', marginTop: 24, textAlign: 'center' }}>Login Required</Text>
          <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 12, marginBottom: 32, fontSize: 16, lineHeight: 24 }}>
            You need to create an account to save your daily steps to the cloud and track your weekly and monthly goals over time!
          </Text>
          <TouchableOpacity style={{ backgroundColor: theme.accent, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 }} onPress={() => setActiveTab('Profile')}>
            <Text style={{ color: theme.bg, fontWeight: 'bold', fontSize: 16 }}>Go to Login / Signup</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (tab) {
      case 'Home': return <HomeScreen steps={globalSteps} goal={dailyGoal} statusMsg={statusMsg} setTab={setActiveTab} />;
      case 'MonthlyReport': return <MonthlyReportScreen steps={globalSteps} goal={dailyGoal} setTab={setActiveTab} />;
      case 'Goals': return <GoalsScreen goal={dailyGoal} setGoal={(g) => { setDailyGoal(g); AsyncStorage.setItem('@daily_goal', g.toString()); }} monthlyGoal={monthlyGoal} setMonthlyGoal={(g) => { setMonthlyGoal(g); AsyncStorage.setItem('@monthly_goal', g.toString()); }} />;
      case 'Profile': return <ProfileScreen setGoal={(g) => { setDailyGoal(g); AsyncStorage.setItem('@daily_goal', g.toString()); }} />;
      default: return null;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    content: { flex: 1 }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {TABS.map(tab => (
            <View key={tab} style={{ width, flex: 1 }}>
              {renderTabContent(tab)}
            </View>
          ))}
        </ScrollView>
      </View>
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}
