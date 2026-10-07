import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.dateText}>3 October 2026</Text>
      </View>
      <View style={styles.headerIcons}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 100 Days</Text>
        </View>
        <View style={styles.profileBtn}>
          <Text style={styles.profileBtnText}>+</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  streakText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
