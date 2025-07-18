// App.js
import React from 'react';
import { AuthProvider } from './app/context/AuthContext';
import { TasksProvider } from './app/context/TasksContext';
import { ThemeProvider } from './app/context/ThemeContext'; // Import the new ThemeProvider
import RootNavigator from './app/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        {/* Wrap the app with ThemeProvider */}
        <ThemeProvider>
          {/* The theme is now handled by the ThemeProvider, so no need to pass it to PaperProvider here */}
          <StatusBar style="auto" />
          <RootNavigator />
        </ThemeProvider>
      </TasksProvider>
    </AuthProvider>
  );
}