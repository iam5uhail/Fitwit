import React, { createContext, useState } from 'react';

export const PALETTES = {
  Green: { name: 'Green', bg: '#0C1511', surface: '#14211A', surface2: '#1B2C24', line: '#253B2E', ink: '#E7F6EA', muted: '#8FA499', accent: '#46C888', accentSoft: '#1F4A35' },
  Mono: { name: 'Mono', bg: '#000000', surface: '#1C1C1E', surface2: '#2C2C2E', line: '#3C3C3E', ink: '#FFFFFF', muted: '#8E8E93', accent: '#FFFFFF', accentSoft: '#3A3A3C' },
  Navy: { name: 'Navy', bg: '#0B1220', surface: '#131D33', surface2: '#1B2842', line: '#26365A', ink: '#E6EEFC', muted: '#8FA0C4', accent: '#4A72FF', accentSoft: '#1E3A80' },
  Teal: { name: 'Teal', bg: '#091A1B', surface: '#12292A', surface2: '#1A383A', line: '#264E50', ink: '#E0F7F8', muted: '#88C0C2', accent: '#26C6DA', accentSoft: '#135D66' },
  Slate: { name: 'Slate', bg: '#17191C', surface: '#222529', surface2: '#30343A', line: '#434950', ink: '#F0F2F5', muted: '#9AA0A6', accent: '#8AB4F8', accentSoft: '#2E3A4D' },
  Crimson: { name: 'Crimson', bg: '#1A0F11', surface: '#261619', surface2: '#331D21', line: '#4D2B32', ink: '#FDECEE', muted: '#C8979F', accent: '#E04A5E', accentSoft: '#5A1D25' },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(PALETTES.Green);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
