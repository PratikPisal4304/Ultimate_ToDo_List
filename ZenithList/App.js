// App.js
import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './app/context/AuthContext';
import { TasksProvider } from './app/context/TasksContext';
import RootNavigator from './app/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

// Define our custom "Zenith" theme
const theme = {
  ...DefaultTheme,
  roundness: 12, // More rounded corners for a modern feel
  colors: {
    ...DefaultTheme.colors,
    primary: '#6A5ACD', // A vibrant slate blue/purple
    accent: '#00BFFF',   // A bright sky blue for accents
    background: '#121212', // A deep, true black for the background
    surface: '#1E1E1E',     // A slightly lighter black for cards and surfaces
    text: '#FFFFFF',
    placeholder: '#A9A9A9',
    onSurface: '#FFFFFF',
    error: '#FF6347', // A tomato red for errors
  },
  dark: true, // This is crucial for react-native-paper's dark theme logic
};

export default function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <PaperProvider theme={theme}>
          {/* Use 'light' style for status bar text to be visible on dark background */}
          <StatusBar style="light" />
          <RootNavigator />
        </PaperProvider>
      </TasksProvider>
    </AuthProvider>
  );
}
