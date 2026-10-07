import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ThemeProvider } from './src/theme/ThemeContext';
import MainNavigator from './src/MainNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <MainNavigator />
    </ThemeProvider>
  );
}
