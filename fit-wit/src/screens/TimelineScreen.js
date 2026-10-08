import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function TimelineScreen({ setTab }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [timelineData, setTimelineData] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem('@user_email');
        if (!email) return;
        
        // Fetch current month data for timeline
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; // YYYY-MM in local time!
        const res = await fetch(`${API_URL}/steps/monthly?email=${email}&month=${dateStr}`);
        const json = await res.json();

        if (json.success && json.data) {
          let sum = 0;
          const formatted = json.data.reverse().map(item => {
            sum += item.steps;
            const d = new Date(item.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dateDisplay = `${months[d.getMonth()]} ${d.getDate()} (${days[d.getDay()]})`;

            return {
              id: item.date,
              dateDisplay: dateDisplay,
              steps: item.steps,
              kcal: (item.steps * 0.04).toFixed(1),
              miles: (item.steps * 0.000473).toFixed(2), // steps to miles
              hours: (item.steps * 0.55 / 3600).toFixed(2).replace('.', ':')
            };
          });
          setTimelineData(formatted);
          setTotalSteps(sum);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMiles = (totalSteps * 0.000473).toFixed(2);
  const totalKcal = (totalSteps * 0.04).toFixed(1);
  const totalHours = Math.floor(totalSteps * 0.55 / 3600);
  const totalMins = Math.floor((totalSteps * 0.55 % 3600) / 60);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setTab('Home')} style={{ padding: 10 }}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timeline</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.summaryCard}>
          <View style={styles.tabsRow}>
            <View style={styles.tabActive}><Text style={styles.tabActiveText}>W</Text></View>
            <Text style={styles.tabInactive}>M</Text>
            <Text style={styles.tabInactive}>Y</Text>
            <Text style={styles.tabInactive}>All</Text>
          </View>
          
          <View style={styles.dateSelector}>
            <Text style={styles.arrow}>{'<'}</Text>
            <Text style={styles.dateRange}>Oct 1 - Oct 9</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </View>

          <View style={styles.bigStatsRow}>
            <Text style={styles.bigSteps}>{totalSteps.toLocaleString()}</Text>
            <Text style={styles.bigStepsLabel}>Total Steps</Text>
          </View>

          <View style={styles.smallStatsRow}>
            <View>
              <Text style={styles.smallStatVal}>{totalMiles}</Text>
              <Text style={styles.smallStatLab}>Mile</Text>
            </View>
            <View>
              <Text style={styles.smallStatVal}>{totalKcal}</Text>
              <Text style={styles.smallStatLab}>Kcal</Text>
            </View>
            <View>
              <Text style={styles.smallStatVal}>{totalHours}h {totalMins}m</Text>
              <Text style={styles.smallStatLab}>Time</Text>
            </View>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderLeft}>This week</Text>
          <Text style={styles.listHeaderRight}>{totalSteps.toLocaleString()} Steps</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {timelineData.map((item, index) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.colLeft}>
                  <Text style={styles.rowSteps}>{item.steps.toLocaleString()}</Text>
                  <Text style={styles.rowDate}>{item.dateDisplay}</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.rowVal}>{item.kcal}</Text>
                  <Text style={styles.rowLab}>Kcal</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.rowVal}>{item.miles}</Text>
                  <Text style={styles.rowLab}>Miles</Text>
                </View>
                <View style={styles.colRight}>
                  <Text style={styles.rowVal}>{item.hours}</Text>
                  <Text style={styles.rowLab}>Hours</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backBtn: { color: theme.ink, fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  summaryCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 20, margin: 16, borderWidth: 1, borderColor: theme.line },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  tabActive: { backgroundColor: theme.accent, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  tabActiveText: { color: theme.bg, fontWeight: 'bold' },
  tabInactive: { color: theme.muted, fontWeight: 'bold', paddingHorizontal: 24, paddingVertical: 8 },
  dateSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  arrow: { color: theme.muted, fontSize: 18, paddingHorizontal: 20 },
  dateRange: { color: theme.ink, fontSize: 14, fontWeight: 'bold' },
  bigStatsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  bigSteps: { color: theme.ink, fontSize: 36, fontWeight: 'bold' },
  bigStepsLabel: { color: theme.muted, fontSize: 12, marginLeft: 8 },
  smallStatsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 },
  smallStatVal: { color: theme.ink, fontSize: 16, fontWeight: 'bold' },
  smallStatLab: { color: theme.muted, fontSize: 12, marginTop: 4 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 10 },
  listHeaderLeft: { color: theme.muted, fontSize: 14 },
  listHeaderRight: { color: theme.ink, fontSize: 14, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.line },
  colLeft: { flex: 2 },
  colCenter: { flex: 1, alignItems: 'flex-end' },
  colRight: { flex: 1, alignItems: 'flex-end' },
  rowSteps: { color: theme.ink, fontSize: 18, fontWeight: 'bold' },
  rowDate: { color: theme.muted, fontSize: 12, marginTop: 4 },
  rowVal: { color: theme.ink, fontSize: 14, fontWeight: 'bold' },
  rowLab: { color: theme.muted, fontSize: 12, marginTop: 4 }
});
