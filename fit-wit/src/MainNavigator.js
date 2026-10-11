import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

import BottomTabs from './components/BottomTabs';
import HomeScreen from './screens/HomeScreen';
import GoalsScreen from './screens/GoalsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MonthlyReportScreen from './screens/MonthlyReportScreen';
import TimelineScreen from './screens/TimelineScreen';
import { IconProfile } from './components/Icons';
import { ThemeContext } from './theme/ThemeContext';
import { API_URL } from './config';

const { width } = Dimensions.get('window');
const TABS = ['Home', 'MonthlyReport', 'Timeline', 'Goals', 'Profile'];

export default function MainNavigator() {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Home');
  const [globalSteps, setGlobalSteps] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Checking...');
  const [dailyGoal, setDailyGoal] = useState(8000);
  const [monthlyGoal, setMonthlyGoal] = useState(250000);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastSyncedSteps, setLastSyncedSteps] = useState(-1);
  const [isAppLoading, setIsAppLoading] = useState(true);

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

      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; // YYYY-MM-DD in local time!

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

        const todayStr = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem('@today_date');

        if (savedDate !== todayStr) {
          // New day, reset steps!
          await AsyncStorage.setItem('@today_date', todayStr);
          await AsyncStorage.setItem('@today_steps', '0');
          currentTotal = 0;
        } else {
          const savedSteps = await AsyncStorage.getItem('@today_steps');
          if (savedSteps) currentTotal = parseInt(savedSteps, 10);
        }

        const savedGoal = await AsyncStorage.getItem('@daily_goal');
        if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));

        const savedMonthlyGoal = await AsyncStorage.getItem('@monthly_goal');
        if (savedMonthlyGoal) setMonthlyGoal(parseInt(savedMonthlyGoal, 10));

        // Fix: Set the initial global steps so it doesn't show 0 before the first step!
        setGlobalSteps(currentTotal);

        // Fetch cloud data on boot so it never resets to 0 if the cloud has steps!
        try {
          const email = await AsyncStorage.getItem('@user_email');
          if (email) {
            const d = new Date();
            const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            const todayCloudStr = `${monthStr}-${String(d.getDate()).padStart(2,'0')}`;
            const cloudRes = await fetch(`${API_URL}/steps/monthly?email=${email}&month=${monthStr}`);
            const cloudJson = await cloudRes.json();
            if (cloudJson.success && cloudJson.data) {
              const todayData = cloudJson.data.find(item => item.date === todayCloudStr);
              if (todayData && todayData.steps > currentTotal) {
                currentTotal = todayData.steps;
                setGlobalSteps(currentTotal);
                AsyncStorage.setItem('@today_steps', currentTotal.toString());
              }
            }
          }
        } catch (e) { console.log("Cloud fetch error", e); }

        // 1. Try to get the highly accurate historical steps from the OS
        if (Platform.OS === 'android') {
          try {
            const isInitialized = await initialize();
            if (isInitialized) {
              const granted = await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);
              if (granted) {
                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const end = new Date();
                
                const result = await readRecords('Steps', {
                  timeRangeFilter: {
                    operator: 'between',
                    startTime: start.toISOString(),
                    endTime: end.toISOString()
                  }
                });
                
                let hcSteps = 0;
                result.records.forEach(r => hcSteps += r.count);

                if (hcSteps > currentTotal) {
                  currentTotal = hcSteps;
                  setGlobalSteps(currentTotal);
                  AsyncStorage.setItem('@today_steps', currentTotal.toString());
                }
              }
            }
          } catch (e) {
            console.log("Health Connect error", e);
          }
        } else {
          try {
            const { status } = await Pedometer.requestPermissionsAsync();
            if (status === 'granted' && await Pedometer.isAvailableAsync()) {
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
          } catch (e) { console.log(e); }
        }

        // 2. Use the Accelerometer for INSTANT live counting (solves the standalone app bug!)
        setStatusMsg('Live Counting Active');
        Accelerometer.setUpdateInterval(30);

        let lastStepTime = Date.now();
        base = currentTotal;

        sub = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();

          // Threshold 1.15 and 400ms to count softer, easier steps
          if (magnitude > 1.15 && now - lastStepTime > 400) {
            lastStepTime = now;
            base += 1;
            setGlobalSteps(base);
            AsyncStorage.setItem('@today_steps', base.toString());
          }
        });
        
        // Hide loader when done!
        setIsAppLoading(false);
      } catch (e) {
        setStatusMsg('Sensor Error');
        setIsAppLoading(false);
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
      case 'Timeline': return <TimelineScreen steps={globalSteps} setTab={setActiveTab} />;
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

  if (isAppLoading) {
    return (
      <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{color: theme.ink, marginTop: 20, fontSize: 18, fontWeight: 'bold'}}>Warming up sensors...</Text>
      </SafeAreaView>
    );
  }

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
