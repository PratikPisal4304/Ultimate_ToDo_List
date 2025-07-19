// app/navigation/AppNavigator.js
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FocusScreen from '../screens/FocusScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HowToUseScreen from '../screens/HowToUseScreen'; // --- IMPORT THE NEW SCREEN ---

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.placeholder}
      barStyle={{ backgroundColor: theme.colors.surface }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-month-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// This Stack Navigator allows us to present screens modally over the tabs
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Focus"
        component={FocusScreen}
        options={{ presentation: 'modal' }}
      />
      {/* --- ADD THE NEW SCREEN TO THE STACK --- */}
      <Stack.Screen
        name="HowToUse"
        component={HowToUseScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;