// App.js
import React from 'react';
import { AuthProvider } from './app/context/AuthContext';
import { TasksProvider } from './app/context/TasksContext';
import { ThemeProvider } from './app/context/ThemeContext';
import RootNavigator from './app/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // --- IMPORT ---

export default function App() {
  return (
    // --- WRAP THE APP WITH SafeAreaProvider ---
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <ThemeProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </ThemeProvider>
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}