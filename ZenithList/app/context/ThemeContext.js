// app/context/ThemeContext.js
import React, { createContext, useState, useMemo } from 'react';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const ThemeContext = createContext();

// Define our custom "Zenith Dark" theme
const zenithDarkTheme = {
  ...PaperDarkTheme,
  roundness: 12,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#6A5ACD',
    accent: '#00BFFF',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    placeholder: '#A9A9A9',
    onSurface: '#FFFFFF',
    error: '#FF6347',
  },
};

// Define our new "Zenith Light" theme
const zenithLightTheme = {
  ...PaperDefaultTheme,
  roundness: 12,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#6A5ACD',
    accent: '#00BFFF',
    background: '#F7F7F7', // Light gray background
    surface: '#FFFFFF',     // White for cards and surfaces
    text: '#121212',
    placeholder: '#666666',
    onSurface: '#000000',
    error: '#B00020',
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