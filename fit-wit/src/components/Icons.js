import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const IconFlame = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3c1 3.2 5 5.4 5 10a5 5 0 0 1-10 0c0-2 .9-3.3 2-4.4.2 1.4.9 2.2 1.8 2.5C10.4 8.6 10.8 5.6 12 3Z"/>
  </Svg>
);

export const IconClock = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="8.5"/>
    <Path d="M12 7.5V12l3 2"/>
  </Svg>
);

export const IconRoute = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="6" cy="18" r="2.2"/>
    <Circle cx="18" cy="6" r="2.2"/>
    <Path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>
  </Svg>
);

export const IconHome = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 11.5 12 4l9 7.5"/>
    <Path d="M5.5 10v9.5h13V10"/>
    <Path d="M10 19.5v-5h4v5"/>
  </Svg>
);

export const IconReports = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 20V11"/>
    <Path d="M12 20V4"/>
    <Path d="M19 20v-7"/>
  </Svg>
);

export const IconGoals = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="8.5"/>
    <Circle cx="12" cy="12" r="4.5"/>
    <Circle cx="12" cy="12" r="1" fill={color}/>
  </Svg>
);

export const IconProfile = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="8.5" r="3.8"/>
    <Path d="M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6"/>
  </Svg>
);

export const IconSun = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="4"/>
    <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/>
  </Svg>
);

export const IconCheck = ({ color, size }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12.5l4.5 4.5L19 7.5"/>
  </Svg>
);
