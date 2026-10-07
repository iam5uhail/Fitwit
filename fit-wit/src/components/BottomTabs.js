import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { IconHome, IconReports, IconGoals, IconProfile } from './Icons';

export default function BottomTabs({ activeTab, onTabChange }) {
  const { theme } = useContext(ThemeContext);

  const tabs = [
    { id: 'Home', icon: IconHome, label: 'Home' },
    { id: 'MonthlyReport', icon: IconReports, label: 'Reports' },
    { id: 'Goals', icon: IconGoals, label: 'Goals' },
    { id: 'Profile', icon: IconProfile, label: 'Profile' }
  ];
  
  const styles = getStyles(theme);

  return (
    <View style={styles.bottomTabs}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const color = isActive ? theme.accent : theme.muted;
        return (
          <TouchableOpacity 
            key={tab.id}
            style={styles.tabItem} 
            onPress={() => onTabChange(tab.id)}
          >
            <View style={styles.iconContainer}>
              <tab.icon color={color} size={20} />
            </View>
            <Text style={[styles.tabLabel, isActive && { color: theme.accent, fontWeight: 'bold' }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 50 : 20, 
    borderTopWidth: 1,
    borderTopColor: theme.line,
    backgroundColor: theme.bg,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    color: theme.muted,
    fontSize: 10,
  }
});
