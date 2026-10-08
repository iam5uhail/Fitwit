import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemeContext } from '../theme/ThemeContext';
import { IconFlame, IconClock, IconRoute, IconSun, IconCheck } from '../components/Icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config';

const getLastThreeMonths = () => {
  const months = [];
  const monthDates = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthNames[d.getMonth()]);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    monthDates.push(`${yearStr}-${monthStr}`);
  }
  return { MONTHS: months, MONTH_DATES: monthDates };
};

const { MONTHS, MONTH_DATES } = getLastThreeMonths();

export default function MonthlyReportScreen({ setTab }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [currentIdx, setCurrentIdx] = useState(2); // Default to Oct
  const [isLoading, setIsLoading] = useState(true);
  const [monthData, setMonthData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const month = MONTHS[currentIdx];

  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };
  const handleNext = () => { if (currentIdx < MONTHS.length - 1) setCurrentIdx(currentIdx + 1); };

  useEffect(() => {
    const fetchMonthData = async () => {
      setIsLoading(true);
      try {
        const email = await AsyncStorage.getItem('@user_email');
        if (!email) return;

        const res = await fetch(`${API_URL}/steps/monthly?email=${email}&month=${MONTH_DATES[currentIdx]}`);
        const json = await res.json();
        
        if (json.success && json.data) {
           let total = 0;
           let mostActive = { steps: 0, date: '' };
           let leastActive = { steps: 999999, date: '' };
           let goalDaysArr = [];
           let daysMap = {};

           json.data.forEach(d => {
             total += d.steps;
             const dayNum = parseInt(d.date.split('-')[2], 10);
             daysMap[dayNum] = { steps: d.steps, goal: d.goal };

             if (d.steps > mostActive.steps) {
               mostActive.steps = d.steps;
               mostActive.date = d.date;
             }
             if (d.steps < leastActive.steps && d.steps > 0) {
               leastActive.steps = d.steps;
               leastActive.date = d.date;
             }
             if (d.steps >= d.goal) goalDaysArr.push(parseInt(d.date.split('-')[2], 10));
           });

           const daysInMonth = new Date(2024, currentIdx + 8, 0).getDate();
           const avg = daysInMonth > 0 ? Math.floor(total / daysInMonth) : 0;

           setMonthData({
              totalSteps: total.toLocaleString(),
              distance: (total * 0.000762).toFixed(2),
              kcal: (total * 0.04).toFixed(1),
              time: `${Math.floor((total * 0.55) / 3600)}h`,
              dailyAvg: avg.toLocaleString(),
              vsLastMonth: currentIdx === 2 ? '-179' : '+90', // Hardcoded trend for simplicity right now
              growthPct: currentIdx === 2 ? '-7%' : '+4%',
              isGrowthPositive: currentIdx !== 2,
              mostActiveSteps: mostActive.steps.toLocaleString(),
              mostActiveDay: mostActive.date ? `${month} ${parseInt(mostActive.date.split('-')[2], 10)}` : '-',
              mostLeisurelySteps: leastActive.steps === 999999 ? '0' : leastActive.steps.toLocaleString(),
              mostLeisurelyDay: leastActive.date ? `${month} ${parseInt(leastActive.date.split('-')[2], 10)}` : '-',
              calendarDays: daysInMonth,
              startDayOfWeek: new Date(2024, currentIdx + 7, 1).getDay(),
              goalDays: goalDaysArr,
              daysMap: daysMap
           });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMonthData();
  }, [currentIdx]);

  // Generate calendar grid
  const daysArray = [];
  if (monthData) {
    for (let i = 0; i < monthData.startDayOfWeek; i++) daysArray.push(null);
    for (let i = 1; i <= monthData.calendarDays; i++) daysArray.push(i);
  }

  const d = monthData || {
    totalSteps: '0', distance: '0', kcal: '0', time: '0h',
    dailyAvg: '0', vsLastMonth: '0', growthPct: '0%', isGrowthPositive: true,
    mostActiveSteps: '0', mostActiveDay: '-', mostLeisurelySteps: '0', mostLeisurelyDay: '-',
    calendarDays: 30, startDayOfWeek: 0, goalDays: []
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <View style={styles.backBtn}>
          <Text style={styles.navTitle}>Month</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn}>
            <Text style={[styles.arrowTxt, currentIdx === 0 && {opacity: 0.2}]}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthName}>{month}</Text>
          <TouchableOpacity onPress={handleNext} style={styles.arrowBtn}>
            <Text style={[styles.arrowTxt, currentIdx === MONTHS.length - 1 && {opacity: 0.2}]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Big Stats */}
        <View style={[styles.calendarCard, { alignItems: 'center', paddingTop: 30, paddingBottom: 30 }]}>
          <Text style={styles.bigStepsLabel}>Total Steps ({month})</Text>
          <Text style={[styles.bigSteps, { marginTop: 4 }]}>{d.totalSteps}</Text>
          <View style={[styles.subStatsRow, { width: '100%', justifyContent: 'space-around', marginTop: 24 }]}>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.subStatVal}>{d.distance}</Text>
              <Text style={styles.subStatLab}>km</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.subStatVal}>{d.kcal}</Text>
              <Text style={styles.subStatLab}>kcal</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.subStatVal}>{d.time}</Text>
              <Text style={styles.subStatLab}>hours</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          
          {selectedDayData && (
            <View style={{ backgroundColor: theme.surface2, borderRadius: 16, padding: 16, alignSelf: 'center', minWidth: '90%', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: theme.line }}>
              <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, padding: 16 }} onPress={() => setSelectedDayData(null)}>
                <Text style={{ color: theme.muted, fontSize: 20, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 8 }}>{month} {selectedDayData.day}</Text>
              <Text style={{ color: theme.ink, fontSize: 24, fontWeight: 'bold' }}>{selectedDayData.steps.toLocaleString()} <Text style={{ fontSize: 14, color: theme.muted }}>Steps</Text></Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12, borderTopWidth: 1, borderTopColor: theme.line, paddingTop: 12 }}>
                <Text style={{ color: theme.ink, fontSize: 12 }}>{((selectedDayData.steps * 0.000473).toFixed(2))} Mile</Text>
                <Text style={{ color: theme.ink, fontSize: 12 }}>|   {((selectedDayData.steps * 0.04).toFixed(1))} Kcal</Text>
                <Text style={{ color: theme.ink, fontSize: 12 }}>|   {Math.floor((selectedDayData.steps * 0.55)/3600)}h {Math.floor(((selectedDayData.steps * 0.55)%3600)/60)}m</Text>
              </View>
            </View>
          )}

          <View style={styles.calendarGrid}>
            {daysArray.map((day, idx) => {
              if (day === null) return <View key={`empty-${idx}`} style={styles.dayCell} />;
              
              const dayData = d.daysMap && d.daysMap[day] ? d.daysMap[day] : null;
              const isGoal = d.goalDays.includes(day);
              
              const isSelected = selectedDayData && selectedDayData.day === day;

              let progress = 0;
              if (dayData && dayData.goal > 0) {
                 progress = Math.min(dayData.steps / dayData.goal, 1);
              }
              if (isSelected) progress = 1; // Full ring for selected

              const size = 36;
              const strokeWidth = 3;
              const radius = (size - strokeWidth) / 2;
              const circumference = radius * 2 * Math.PI;
              const strokeDashoffset = circumference - progress * circumference;

              return (
                <View key={day} style={styles.dayCell}>
                  <TouchableOpacity 
                    style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setSelectedDayData({ day, steps: dayData ? dayData.steps : 0 })}
                  >
                    <Svg width={size} height={size} style={{ position: 'absolute' }}>
                      <Circle
                        stroke={isSelected ? '#1E90FF' : theme.surface2}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={isSelected ? 0 : strokeWidth}
                        fill={isSelected ? '#1E90FF' : 'none'}
                      />
                      {!isSelected && progress > 0 && (
                        <Circle
                          stroke={theme.accent}
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="none"
                          rotation="-90"
                          originX={size / 2}
                          originY={size / 2}
                        />
                      )}
                    </Svg>
                    <Text style={[styles.dayText, isGoal && styles.dayTextGoal, isSelected && { color: '#FFF' }]}>{day}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Monthly Spark */}
        {d.goalDays.length > 0 && (
          <View style={styles.sparkCard}>
            <View style={styles.sparkIconBox}>
              <Text style={{fontSize:18}}>🏆</Text>
            </View>
            <View>
              <Text style={styles.sparkTitle}>Monthly Spark</Text>
              <Text style={styles.sparkSub}>A good start! You've hit your step goal {d.goalDays.length} times this month.</Text>
            </View>
          </View>
        )}

        {/* Trends */}
        <Text style={styles.sectionTitle}>Trends ({month})</Text>
        <View style={styles.twoColGrid}>
          <View style={styles.cardHalf}>
            <View style={styles.iconCircleBlue}><IconRoute color={theme.name === 'Mono' ? '#000' : '#FFF'} size={20} /></View>
            <View style={{marginTop: 30}}>
              <Text style={styles.cardHalfVal}>{d.dailyAvg} <Text style={styles.cardHalfSub}>Steps</Text></Text>
              <Text style={styles.cardHalfLab}>Daily Average</Text>
            </View>
          </View>
          <View style={styles.cardHalf}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <View style={[styles.iconCircleGreen, !d.isGrowthPositive && {backgroundColor: '#ff4757'}]}>
                <Text style={{color:'#FFF', fontWeight:'bold', fontSize:18}}>{d.isGrowthPositive ? '↗' : '↘'}</Text>
              </View>
              <Text style={[styles.pctBadge, d.isGrowthPositive ? {color: '#2ed573'} : {color: '#ff4757'}]}>{d.growthPct}</Text>
            </View>
            <View style={{marginTop: 30}}>
              <Text style={styles.cardHalfVal}>{d.vsLastMonth} <Text style={styles.cardHalfSub}>Steps</Text></Text>
              <Text style={styles.cardHalfLab}>vs. Last Month Avg</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <Text style={styles.sectionTitle}>Statistics ({month})</Text>
        <View style={styles.twoColGrid}>
          <View style={styles.cardHalf}>
            <Text style={{fontSize: 28, marginBottom: 20}}>😎</Text>
            <View>
              <Text style={styles.cardHalfVal}>{d.mostActiveSteps} <Text style={styles.cardHalfSub}>Steps</Text></Text>
              <Text style={styles.cardHalfLab}>Most Active Day</Text>
              <Text style={styles.cardHalfDate}>{d.mostActiveDay}</Text>
            </View>
          </View>
          <View style={styles.cardHalf}>
            <Text style={{fontSize: 28, marginBottom: 20}}>☕</Text>
            <View>
              <Text style={styles.cardHalfVal}>{d.mostLeisurelySteps} <Text style={styles.cardHalfSub}>Steps</Text></Text>
              <Text style={styles.cardHalfLab}>Most Leisurely Day</Text>
              <Text style={styles.cardHalfDate}>{d.mostLeisurelyDay}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg }, 
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { color: theme.ink, fontSize: 24, marginRight: 10 },
  navTitle: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  editBtn: { color: theme.accent, fontSize: 16, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 60 },
  
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 40 },
  arrowBtn: { padding: 10 },
  arrowTxt: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  monthName: { color: theme.ink, fontSize: 18, fontWeight: 'bold' },
  
  bigStatsContainer: { marginBottom: 30 },
  bigSteps: { color: theme.ink, fontSize: 42, fontWeight: 'bold' },
  bigStepsLabel: { color: theme.muted, fontSize: 14, fontWeight: 'normal' },
  subStatsRow: { flexDirection: 'row', marginTop: 12 },
  subStatBox: { marginRight: 32 },
  subStatVal: { color: theme.ink, fontSize: 16, fontWeight: 'bold' },
  subStatLab: { color: theme.muted, fontSize: 12, marginTop: 2 },
  
  calendarCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.line },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface2, justifyContent: 'center', alignItems: 'center' },
  dayCircleGoal: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.accent },
  dayText: { color: theme.muted, fontSize: 14 },
  dayTextGoal: { color: theme.ink, fontWeight: 'bold' },
  
  sparkCard: { backgroundColor: theme.surface, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: theme.line },
  sparkIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface2, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  sparkTitle: { color: theme.ink, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  sparkSub: { color: theme.muted, fontSize: 12, paddingRight: 40 },
  
  sectionTitle: { color: theme.ink, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  twoColGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  cardHalf: { width: '48%', backgroundColor: theme.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: theme.line },
  
  iconCircleBlue: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center' },
  iconCircleGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2ed573', justifyContent: 'center', alignItems: 'center' },
  iconCircleGrey: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface2, justifyContent: 'center', alignItems: 'center' },
  
  pctBadge: { fontSize: 14, fontWeight: 'bold' },
  
  cardHalfVal: { color: theme.ink, fontSize: 22, fontWeight: 'bold' },
  cardHalfSub: { color: theme.muted, fontSize: 12, fontWeight: 'normal' },
  cardHalfLab: { color: theme.muted, fontSize: 12, marginTop: 4 },
  cardHalfDate: { color: theme.muted, fontSize: 10, marginTop: 4, opacity: 0.6 }
});
