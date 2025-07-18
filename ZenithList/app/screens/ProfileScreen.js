// app/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Switch, useTheme, Divider } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import the ThemeContext
import { handleSignOut } from '../firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext); // Consume theme context
  const theme = useTheme();

  const onSignOut = () => {
    handleSignOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
            colors={[theme.colors.primary, '#6A5ACD99']}
            style={styles.header}
        >
            <Avatar.Text size={90} label={user?.email?.[0].toUpperCase() || 'A'} style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.email}>{user?.email || 'Anonymous'}</Text>
        </LinearGradient>
      <ScrollView style={styles.content}>
        <List.Section style={styles.settingsSection}>
            <List.Subheader style={styles.subheader}>Appearance</List.Subheader>
            <List.Item
            title="Dark Mode"
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
            style={[styles.listItem, {backgroundColor: theme.colors.surface}]}
            />
        </List.Section>

        <List.Section>
            <List.Subheader style={styles.subheader}>Account</List.Subheader>
            <List.Item
            title="Log Out"
            left={() => <List.Icon icon="logout" color={theme.colors.error} />}
            onPress={onSignOut}
            style={[styles.listItem, {backgroundColor: theme.colors.surface}]}
            titleStyle={{color: theme.colors.error}}
            />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    padding: 20,
  },
  avatar: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  email: {
    color: '#fff',
    fontWeight: 'bold',
  },
  settingsSection: {
      marginBottom: 20,
  },
  subheader: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  listItem: {
      borderRadius: 12,
      marginBottom: 10,
  },
});

export default ProfileScreen;