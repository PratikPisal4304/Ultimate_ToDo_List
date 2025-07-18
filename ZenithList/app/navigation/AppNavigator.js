// app/navigation/AppNavigator.js
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FocusScreen from '../screens/FocusScreen'; // We will create this next

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    activeColor="#fff"
    inactiveColor="#a3a3a3"
    barStyle={{ backgroundColor: '#1e1e1e' }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Projects"
      component={ProjectsScreen}
      options={{
        tabBarLabel: 'Projects',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="briefcase-variant" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="account" color={color} size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

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
    </Stack.Navigator>
  );
};

export default AppNavigator;