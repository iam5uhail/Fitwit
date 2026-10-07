import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { IconFlame, IconClock, IconRoute } from '../components/Icons';

export default function GoalsScreen({ goal, setGoal, monthlyGoal, setMonthlyGoal }) {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('daily');
  const options = [5000, 8000, 10000, 12000];
  const monthlyOptions = [150000, 200000, 250000, 300000];
  const styles = getStyles(theme);

  const currentAvg = Math.floor(goal * 0.85);
  const previousAvg = 7400;
  const growth = ((currentAvg - previousAvg) / previousAvg) * 100;
  const isPositive = growth >= 0;
  const growthStr = `${isPositive ? '+' : ''}${growth.toFixed(1)}%`;

  const monthlyCurrentAvg = Math.floor(monthlyGoal * 0.9);
  const monthlyPreviousAvg = 210000;
  const monthlyGrowth = ((monthlyCurrentAvg - monthlyPreviousAvg) / monthlyPreviousAvg) * 100;
  const monthlyIsPositive = monthlyGrowth >= 0;
  const monthlyGrowthStr = `${monthlyIsPositive ? '+' : ''}${monthlyGrowth.toFixed(1)}%`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View style={{ flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 24, padding: 4, marginBottom: 32 }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: activeTab === 'daily' ? theme.surface : 'transparent', borderRadius: 20 }} 
            onPress={() => setActiveTab('daily')}
          >
            <Text style={{ color: activeTab === 'daily' ? theme.ink : theme.muted, fontWeight: 'bold', fontSize: 16 }}>Daily Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: activeTab === 'monthly' ? theme.surface : 'transparent', borderRadius: 20 }} 
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={{ color: activeTab === 'monthly' ? theme.ink : theme.muted, fontWeight: 'bold', fontSize: 16 }}>Monthly Goal</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'daily' ? (
          <>
            <Text style={styles.title}>Daily Target</Text>
            <Text style={styles.subtitle}>Pick a target you can hit most days</Text>
            
            <View style={styles.card}>
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setGoal(goal > 1000 ? goal - 500 : goal)}>
                  <Text style={styles.circleBtnText}>-</Text>
                </TouchableOpacity>
                <View style={styles.goalDisplay}>
                  <Text style={styles.goalNumber}>{goal.toLocaleString()}</Text>
                  <Text style={styles.goalLabel}>STEPS A DAY</Text>
                </View>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setGoal(goal + 500)}>
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pillRow}>
                {options.map(o => (
                  <TouchableOpacity key={o} onPress={() => setGoal(o)} style={[styles.pill, goal === o && { backgroundColor: theme.accent }]}>
                    <Text style={[styles.pillText, goal === o && { color: theme.name === 'Mono' ? '#000' : '#FFF' }]}>{o.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 1, backgroundColor: theme.line, marginVertical: 24 }} />
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconRoute color={theme.accent} size={18} /></View>
                  <Text style={styles.statVal}>{(goal * 0.000762).toFixed(1)}</Text>
                  <Text style={styles.statLab}>km</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconFlame color="#F4B84F" size={18} /></View>
                  <Text style={styles.statVal}>{(goal * 0.04).toFixed(0)}</Text>
                  <Text style={styles.statLab}>kcal</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconClock color="#70B4FF" size={18} /></View>
                  <Text style={styles.statVal}>{Math.floor(goal * 0.01)}</Text>
                  <Text style={styles.statLab}>min</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Daily Insights</Text>
            <View style={[styles.card, { padding: 20 }]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={{color: theme.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 8}}>THIS WEEK AVG</Text>
                  <Text style={{color: theme.ink, fontSize: 24, fontWeight: '900'}}>{currentAvg.toLocaleString()}</Text>
                </View>
                
                <View style={{width: 1, height: 40, backgroundColor: theme.line}} />
                
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={{color: theme.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 8}}>LAST WEEK AVG</Text>
                  <Text style={{color: theme.ink, fontSize: 24, fontWeight: '900'}}>{previousAvg.toLocaleString()}</Text>
                </View>
              </View>

              <View style={{ backgroundColor: isPositive ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: isPositive ? '#2ed573' : '#ff4757', justifyContent: 'center', alignItems: 'center', marginRight: 12}}>
                  <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 18}}>{isPositive ? '↗' : '↘'}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{ color: isPositive ? '#2ed573' : '#ff4757', fontSize: 18, fontWeight: 'bold' }}>{growthStr}</Text>
                  <Text style={{ color: isPositive ? '#2ed573' : '#ff4757', fontSize: 13, marginTop: 4 }}>
                    {isPositive ? 'Awesome! You are walking more than last week. Keep it up!' : 'You are walking a bit less this week. Time to step it up!'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Monthly Target</Text>
            <Text style={styles.subtitle}>Set your target for the entire month</Text>
            
            <View style={styles.card}>
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setMonthlyGoal(monthlyGoal > 50000 ? monthlyGoal - 10000 : monthlyGoal)}>
                  <Text style={styles.circleBtnText}>-</Text>
                </TouchableOpacity>
                <View style={styles.goalDisplay}>
                  <Text style={styles.goalNumber}>{(monthlyGoal / 1000).toFixed(0)}k</Text>
                  <Text style={styles.goalLabel}>STEPS A MONTH</Text>
                </View>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setMonthlyGoal(monthlyGoal + 10000)}>
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pillRow}>
                {monthlyOptions.map(o => (
                  <TouchableOpacity key={o} onPress={() => setMonthlyGoal(o)} style={[styles.pill, monthlyGoal === o && { backgroundColor: theme.accent }]}>
                    <Text style={[styles.pillText, monthlyGoal === o && { color: theme.name === 'Mono' ? '#000' : '#FFF' }]}>{(o / 1000).toFixed(0)}k</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 1, backgroundColor: theme.line, marginVertical: 24 }} />
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconRoute color={theme.accent} size={18} /></View>
                  <Text style={styles.statVal}>{(monthlyGoal * 0.000762).toFixed(0)}</Text>
                  <Text style={styles.statLab}>km</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconFlame color="#F4B84F" size={18} /></View>
                  <Text style={styles.statVal}>{(monthlyGoal * 0.04).toLocaleString()}</Text>
                  <Text style={styles.statLab}>kcal</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.statIcon}><IconClock color="#70B4FF" size={18} /></View>
                  <Text style={styles.statVal}>{Math.floor(monthlyGoal * 0.01 / 60)}</Text>
                  <Text style={styles.statLab}>hours</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Monthly Insights</Text>
            <View style={[styles.card, { padding: 20 }]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={{color: theme.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 8}}>THIS MONTH</Text>
                  <Text style={{color: theme.ink, fontSize: 24, fontWeight: '900'}}>{(monthlyCurrentAvg / 1000).toFixed(0)}k</Text>
                </View>
                
                <View style={{width: 1, height: 40, backgroundColor: theme.line}} />
                
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={{color: theme.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 8}}>LAST MONTH</Text>
                  <Text style={{color: theme.ink, fontSize: 24, fontWeight: '900'}}>{(monthlyPreviousAvg / 1000).toFixed(0)}k</Text>
                </View>
              </View>

              <View style={{ backgroundColor: monthlyIsPositive ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: monthlyIsPositive ? '#2ed573' : '#ff4757', justifyContent: 'center', alignItems: 'center', marginRight: 12}}>
                  <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 18}}>{monthlyIsPositive ? '↗' : '↘'}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{ color: monthlyIsPositive ? '#2ed573' : '#ff4757', fontSize: 18, fontWeight: 'bold' }}>{monthlyGrowthStr}</Text>
                  <Text style={{ color: monthlyIsPositive ? '#2ed573' : '#ff4757', fontSize: 13, marginTop: 4 }}>
                    {monthlyIsPositive ? 'Incredible! You are on track to beat last month.' : 'You are slightly behind last month\'s pace. Keep pushing!'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20, paddingTop: 40 },
  title: { color: theme.ink, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: theme.muted, fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: theme.surface, borderRadius: 32, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.line },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface2, justifyContent: 'center', alignItems: 'center' },
  circleBtnText: { color: theme.ink, fontSize: 24 },
  goalDisplay: { alignItems: 'center' },
  goalNumber: { color: theme.ink, fontSize: 40, fontWeight: '900' },
  goalLabel: { color: theme.muted, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: theme.surface2 },
  pillText: { color: theme.muted, fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { color: theme.ink, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statIcon: { marginBottom: 8 },
  statVal: { color: theme.ink, fontSize: 24, fontWeight: 'bold' },
  statLab: { color: theme.muted, fontSize: 12 }
});
