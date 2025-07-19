// App.js

// --- (1) INITIALIZE CRITICAL NAVIGATION LIBRARIES ---
// These must be imported at the very top of your entry file.
// This ensures that the native code for gestures and screens is loaded first.

// For handling gestures like swipes and taps throughout the app.
import 'react-native-gesture-handler';

// For enabling native screens, which improves navigation performance.
import { enableScreens } from 'react-native-screens';

// --- This function call activates native screens ---
enableScreens();


// --- (2) STANDARD REACT & EXPO IMPORTS ---
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- (3) CUSTOM PROVIDERS & NAVIGATOR ---
// Your application's context providers and main navigator.
import { AuthProvider } from './app/context/AuthContext';
import { TasksProvider } from './app/context/TasksContext';
import { ThemeProvider } from './app/context/ThemeContext';
import RootNavigator from './app/navigation/RootNavigator';


/**
 * The main App component for Zenith List.
 *
 * This component sets up all the necessary context providers for the application:
 * - SafeAreaProvider: Handles safe areas on devices with notches.
 * - AuthProvider: Manages user authentication state.
 * - TasksProvider: Manages the to-do list data.
 * - ThemeProvider: Manages the app's theme (light/dark mode).
 *
 * It then renders the RootNavigator, which controls all app navigation.
 */
export default function App() {
  return (
    // Providers are nested to ensure child components have access to the contexts.
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <ThemeProvider>
            {/* The Expo StatusBar component allows for easy styling of the system status bar. */}
            <StatusBar style="auto" />
            
            {/* RootNavigator contains the main app navigation logic. */}
            <RootNavigator />
          </ThemeProvider>
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}