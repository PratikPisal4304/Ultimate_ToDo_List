// App.js (Updated)
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './app/context/AuthContext';
import { TasksProvider } from './app/context/TasksContext';
import RootNavigator from './app/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <PaperProvider>
          <RootNavigator />
        </PaperProvider>
      </TasksProvider>
    </AuthProvider>
  );
}