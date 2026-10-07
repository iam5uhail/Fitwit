import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CircularProgress from '../components/CircularProgress';
import { ThemeContext, PALETTES } from '../theme/ThemeContext';
import { IconFlame, IconClock, IconRoute, IconSun, IconCheck } from '../components/Icons'; 

export default function HomeScreen({ steps, goal, statusMsg, setTab }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showThemePicker, setShowThemePicker] = useState(false);

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
          <Text style={styles.thisWeekTitle}>Activity Breakdown</Text>
        </View>
        
        <View style={{marginBottom: 20}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Text style={{color: theme.ink, fontSize: 14, fontWeight: 'bold'}}>Vigorous</Text>
            <Text style={{color: theme.muted, fontSize: 14}}>{formatTime(vigorous)}</Text>
          </View>
          <View style={{height: 10, backgroundColor: theme.surface2, borderRadius: 5}}>
            <View style={{height: 10, backgroundColor: '#ff4757', borderRadius: 5, width: `${vigPct}%`}} />
          </View>
        </View>

        <View style={{marginBottom: 20}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Text style={{color: theme.ink, fontSize: 14, fontWeight: 'bold'}}>Moderate</Text>
            <Text style={{color: theme.muted, fontSize: 14}}>{formatTime(moderate)}</Text>
          </View>
          <View style={{height: 10, backgroundColor: theme.surface2, borderRadius: 5}}>
            <View style={{height: 10, backgroundColor: '#ffa502', borderRadius: 5, width: `${modPct}%`}} />
          </View>
        </View>
        
        <View style={{marginBottom: 8}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Text style={{color: theme.ink, fontSize: 14, fontWeight: 'bold'}}>Light</Text>
            <Text style={{color: theme.muted, fontSize: 14}}>{formatTime(light)}</Text>
          </View>
          <View style={{height: 10, backgroundColor: theme.surface2, borderRadius: 5}}>
            <View style={{height: 10, backgroundColor: '#2ed573', borderRadius: 5, width: `${lightPct}%`}} />
          </View>
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
  miniChart: { flexDirection: 'row', justifyContent: 'space-between', height: 110, alignItems: 'flex-end', paddingHorizontal: 4, marginTop: 5 },
  miniBarCol: { alignItems: 'center', width: 32 },
  miniBarText: { color: theme.muted, fontSize: 10, fontWeight: 'bold', marginBottom: 6 },
  miniBar: { width: 14, backgroundColor: theme.surface2, borderRadius: 10, marginBottom: 8 },
  miniDay: { color: theme.muted, fontSize: 12 }
});
