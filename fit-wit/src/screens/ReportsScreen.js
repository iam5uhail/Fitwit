import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import WeeklyChart from '../components/WeeklyChart';
import { ThemeContext } from '../theme/ThemeContext';
import { IconFlame, IconClock, IconRoute, IconSteps } from '../components/Icons'; 

export default function ReportsScreen({ steps, goal, setTab }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateRangeStr = `${start.getDate()} ${months[start.getMonth()]} - ${today.getDate()} ${months[today.getMonth()]}`;

  const remaining = Math.max(0, goal - steps);
  const isGoalReached = steps >= goal;
  const distanceKm = (steps * 0.000762).toFixed(2);
  const kcal = (steps * 0.04).toFixed(0);
  const totalSeconds = Math.floor(steps * 0.55);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
       <View style={styles.header}>
         <Text style={styles.title}>Weekly report</Text>
         <Text style={styles.subtitle}>{dateRangeStr}</Text>
       </View>
       
       <View style={styles.tabsRow}>
         <View style={[styles.activeTab, { backgroundColor: theme.surface2 }]}>
           <Text style={[styles.tabText, { color: theme.ink }]}>Steps</Text>
         </View>
         <View style={styles.inactiveTab}><Text style={styles.inactiveText}>Calories</Text></View>
         <View style={styles.inactiveTab}><Text style={styles.inactiveText}>Distance</Text></View>
         <View style={styles.inactiveTab}><Text style={styles.inactiveText}>Time</Text></View>
       </View>
       
       <View style={styles.chartCard}>
         <View style={styles.statHeader}>
           <View style={styles.statCol}>
             <Text style={styles.statLabel}>TOTAL</Text>
             <Text style={styles.statValue}>46,448</Text>
             <Text style={styles.statUnit}>steps</Text>
           </View>
           <View style={styles.statCol}>
             <Text style={styles.statLabel}>DAILY AVG</Text>
             <Text style={styles.statValue}>7,741</Text>
             <Text style={styles.statUnit}>steps</Text>
           </View>
           <View style={styles.statCol}>
             <Text style={styles.statLabel}>BEST DAY</Text>
             <Text style={styles.statValue}>Thu</Text>
             <Text style={styles.statUnit}>10,240</Text>
           </View>
         </View>
         
         <WeeklyChart currentSteps={steps} theme={theme} />
       </View>

       <View style={styles.dayHeader}>
         <Text style={styles.dayTitle}>Today</Text>
         <View style={[styles.goalBadge, { backgroundColor: isGoalReached ? theme.accentSoft : theme.surface }]}>
           <Text style={[styles.goalBadgeText, { color: isGoalReached ? theme.accent : theme.muted }]}>
             {isGoalReached ? 'Goal reached' : `${remaining.toLocaleString()} to goal`}
           </Text>
         </View>
       </View>

       <View style={styles.grid}>
         <View style={styles.statCard}>
           <View style={styles.cardHeader}>
             <IconRoute color={theme.accent} size={16} />
             <Text style={styles.cardLabel}>Steps</Text>
           </View>
           <Text style={styles.cardValue}>{steps.toLocaleString()}</Text>
         </View>
         
         <View style={styles.statCard}>
           <View style={styles.cardHeader}>
             <IconFlame color="#F4B84F" size={16} />
             <Text style={styles.cardLabel}>Calories</Text>
           </View>
           <Text style={styles.cardValue}>{kcal}</Text>
         </View>
         
         <View style={styles.statCard}>
           <View style={styles.cardHeader}>
             <IconClock color="#70B4FF" size={16} />
             <Text style={styles.cardLabel}>Time</Text>
           </View>
           <Text style={styles.cardValue}>{timeStr}</Text>
         </View>
         
         <View style={styles.statCard}>
           <View style={styles.cardHeader}>
             <IconRoute color={theme.accent} size={16} />
             <Text style={styles.cardLabel}>Distance</Text>
           </View>
           <Text style={styles.cardValue}>{distanceKm} km</Text>
         </View>
       </View>

       <TouchableOpacity style={styles.moreBtn} onPress={() => setTab('MonthlyReport')}>
         <Text style={[styles.moreBtnText, { color: theme.accent }]}>More: monthly report {'>'}</Text>
       </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  header: { marginBottom: 24 },
  title: { color: theme.ink, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: theme.muted, fontSize: 14 },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, backgroundColor: theme.surface, borderRadius: 30, padding: 4, borderWidth: 1, borderColor: theme.line },
  activeTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  tabText: { fontSize: 12, fontWeight: 'bold' },
  inactiveTab: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
  inactiveText: { color: theme.muted, fontSize: 12, fontWeight: 'bold' },
  chartCard: { backgroundColor: theme.surface, borderRadius: 32, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.line },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCol: { flex: 1 },
  statLabel: { color: theme.muted, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  statValue: { color: theme.ink, fontSize: 18, fontWeight: 'bold' },
  statUnit: { color: theme.muted, fontSize: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  dayTitle: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  goalBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.line },
  goalBadgeText: { fontSize: 10, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: theme.surface, borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.line },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardLabel: { color: theme.muted, fontSize: 12, marginLeft: 8 },
  cardValue: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  moreBtn: { borderWidth: 1, borderColor: theme.line, borderRadius: 30, paddingVertical: 16, alignItems: 'center', backgroundColor: theme.surface },
  moreBtnText: { fontSize: 14, fontWeight: 'bold' }
});
