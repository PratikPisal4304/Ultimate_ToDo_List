// app/context/ThemeContext.js
import React, { createContext, useState, useMemo } from 'react';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const ThemeContext = createContext();

// A richer, more sophisticated dark theme for a premium feel.
const zenithDarkTheme = {
  ...PaperDarkTheme,
  roundness: 12,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#7B68EE', 
    accent: '#00BFFF',
    background: '#0D0D0D', 
    surface: '#1A1A1A',     
    text: '#EAEAEA',
    placeholder: '#A9A9A9',
    onSurface: '#FFFFFF',
    error: '#FF6347',
    headerGradient: ['#4c3a99', '#1a1a1a'],
    // Dedicated calendar colors for dark mode
    calendar: {
      background: '#1A1A1A',
      text: '#EAEAEA',
      dayText: '#EAEAEA',
      todayText: '#7B68EE',
      selectedDayBackground: '#7B68EE',
      selectedDayText: '#FFFFFF',
      arrowColor: '#7B68EE',
      monthText: '#EAEAEA',
      textDisabled: '#555555',
    }
  },
};

// A clean and modern light theme.
const zenithLightTheme = {
  ...PaperDefaultTheme,
  roundness: 12,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#6A5ACD',
    accent: '#00BFFF',
    background: '#F7F7F7', 
    surface: '#FFFFFF',     
    text: '#121212',
    placeholder: '#666666',
    onSurface: '#000000',
    error: '#B00020',
    headerGradient: ['#8A7DDE', '#F7F7F7'],
    // Dedicated calendar colors for light mode
    calendar: {
      background: '#FFFFFF',
      text: '#121212',
      dayText: '#121212',
      todayText: '#6A5ACD',
      selectedDayBackground: '#6A5ACD',
      selectedDayText: '#FFFFFF',
      arrowColor: '#6A5ACD',
      monthText: '#121212',
      textDisabled: '#d9e1e8',
    }
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const theme = useMemo(() => (isDarkMode ? zenithDarkTheme : zenithLightTheme), [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};