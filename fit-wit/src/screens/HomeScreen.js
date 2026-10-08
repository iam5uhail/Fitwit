import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CircularProgress from '../components/CircularProgress';
import { ThemeContext, PALETTES } from '../theme/ThemeContext';
import { IconFlame, IconClock, IconRoute, IconSun, IconCheck } from '../components/Icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function HomeScreen({ steps, goal, statusMsg, setTab }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [recentDays, setRecentDays] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const email = await AsyncStorage.getItem('@user_email');
        if (!email) return;
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const res = await fetch(`${API_URL}/steps/monthly?email=${email}&month=${dateStr}`);
        const json = await res.json();
        if (json.success && json.data) {
          const formatted = json.data.reverse().map(item => {
            const dt = new Date(item.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
              id: item.date,
              dateDisplay: `${months[dt.getMonth()]} ${dt.getDate()} (${days[dt.getDay()]})`,
              steps: item.steps,
              kcal: (item.steps * 0.04).toFixed(1),
              miles: (item.steps * 0.000473).toFixed(2),
              hours: (item.steps * 0.55 / 3600).toFixed(2).replace('.', ':')
            };
          });
          setRecentDays(formatted.slice(0, 3)); // Get last 3 days
        }
      } catch(e) {}
    };
    fetchRecent();
  }, []);

  const distanceKm = (steps * 0.000762).toFixed(2);
  const kcal = (steps * 0.04).toFixed(0);
  const totalSeconds = Math.floor(steps * 0.55);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const vigorous = Math.floor(steps * 0.002); 
  const moderate = Math.floor(steps * 0.008); 
  const light = Math.floor(steps * 0.02); 
  
  const formatTime = (m) => {
    if (m === 0) return '0 min';
    if (m < 60) return `${m} min`;
    return `${Math.floor(m/60)}h ${m%60}m`;
  };

  const vigPct = Math.min(vigorous / 30 * 100, 100);
  const modPct = Math.min(moderate / 90 * 100, 100);
  const lightPct = Math.min(light / 240 * 100, 100);

  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`;

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerSubtitle}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowThemePicker(!showThemePicker)}>
          <IconSun color={theme.ink} size={18} />
        </TouchableOpacity>
      </View>

      {showThemePicker && (
        <View style={styles.themePickerCard}>
          <Text style={styles.themePickerTitle}>App color <Text style={styles.themePickerName}>{theme.name}</Text></Text>
          <View style={styles.colorRow}>
            {Object.values(PALETTES).map(color => {
              const isActive = theme.name === color.name;
              const isMono = color.name === 'Mono';
              return (
                <TouchableOpacity 
                  key={color.name}
                  onPress={() => setTheme(color)}
                  style={[styles.colorOuter, isActive && { borderColor: theme.muted, borderWidth: 2 }]}
                >
                  <View style={[styles.colorInner, { backgroundColor: color.accent }]}>
                    {isActive && <IconCheck color={isMono ? '#000' : '#FFF'} size={18} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.badgeAuto}>
            <View style={styles.greenDot} />
            <Text style={styles.badgeAutoText}>{statusMsg}</Text>
          </View>
          <View style={styles.badgeGoal}>
            <Text style={styles.badgeGoalText}>Goal {goal.toLocaleString()}</Text>
          </View>
        </View>

        <CircularProgress steps={steps} goal={goal} color={theme.accent} />

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIcon}><IconFlame color="#F4B84F" size={18} /></View>
            <Text style={styles.statValue}>{kcal}</Text>
            <Text style={styles.statLabel}>Calories (kcal)</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIcon}><IconClock color="#70B4FF" size={18} /></View>
            <Text style={styles.statValue}>{timeStr}</Text>
            <Text style={styles.statLabel}>Time (min:sec)</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIcon}><IconRoute color={theme.accent} size={18} /></View>
            <Text style={styles.statValue}>{distanceKm}</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
        </View>
        
      </View>

      <View style={styles.card}>
        <View style={styles.thisWeekHeader}>
          <Text style={styles.thisWeekTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => setTab('Timeline')}>
            <Text style={{ color: theme.accent, fontSize: 14, fontWeight: 'bold' }}>Day wise list {'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.listContainer}>
          {recentDays.length === 0 ? <Text style={{color: theme.muted}}>Loading...</Text> : null}
          {recentDays.map((item, index) => {
            // If it's today, we inject the live steps exactly like TimelineScreen does!
            const dToday = new Date();
            const todayStr = `${dToday.getFullYear()}-${String(dToday.getMonth()+1).padStart(2,'0')}-${String(dToday.getDate()).padStart(2,'0')}`;
            const isToday = item.id === todayStr;
            const actualSteps = isToday && steps > item.steps ? steps : item.steps;

            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.colLeft}>
                  <Text style={styles.rowSteps}>{actualSteps.toLocaleString()}</Text>
                  <Text style={styles.rowDate}>{isToday ? 'Today' : item.dateDisplay}</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.rowVal}>{(actualSteps * 0.04).toFixed(1)}</Text>
                  <Text style={styles.rowLab}>Kcal</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.rowVal}>{(actualSteps * 0.000473).toFixed(2)}</Text>
                  <Text style={styles.rowLab}>Miles</Text>
                </View>
                <View style={styles.colRight}>
                  <Text style={styles.rowVal}>{(actualSteps * 0.55 / 3600).toFixed(2).replace('.', ':')}</Text>
                  <Text style={styles.rowLab}>Hours</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: theme.ink, fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: theme.muted, fontSize: 14 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.line },
  themePickerCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.line },
  themePickerTitle: { color: theme.ink, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  themePickerName: { color: theme.muted, fontWeight: 'normal', fontSize: 14 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  colorOuter: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorInner: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: theme.surface, borderRadius: 32, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.line },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeAuto: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.accentSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  greenDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, backgroundColor: theme.accent },
  badgeAutoText: { fontSize: 12, fontWeight: 'bold', color: theme.accent },
  badgeGoal: { backgroundColor: theme.surface2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeGoalText: { color: theme.muted, fontSize: 13, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: theme.surface2, borderRadius: 20, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statIcon: { marginBottom: 12 },
  statValue: { color: theme.ink, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: theme.muted, fontSize: 10 },
  footerRow: { alignItems: 'center', marginTop: 10 },
  footerText: { color: theme.muted, fontSize: 14 },
  thisWeekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  thisWeekTitle: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  thisWeekLink: { fontSize: 14, color: theme.accent },
  listContainer: { marginTop: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface2, padding: 16, borderRadius: 16, marginBottom: 8 },
  colLeft: { flex: 2 },
  colCenter: { flex: 1, alignItems: 'flex-end' },
  colRight: { flex: 1, alignItems: 'flex-end' },
  rowSteps: { color: theme.ink, fontSize: 16, fontWeight: 'bold' },
  rowDate: { color: theme.muted, fontSize: 12, marginTop: 4 },
  rowVal: { color: theme.ink, fontSize: 13, fontWeight: 'bold' },
  rowLab: { color: theme.muted, fontSize: 11, marginTop: 4 }
});
