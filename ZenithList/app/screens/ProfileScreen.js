// app/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List, Switch, useTheme } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import the ThemeContext
import { handleSignOut } from '../firebase/auth';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext); // Consume theme context
  const theme = useTheme();

  const onSignOut = () => {
    handleSignOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.profileInfo}>
        <Avatar.Text size={80} label={user?.email?.[0].toUpperCase() || 'A'} style={styles.avatar} />
        <Text variant="titleLarge" style={styles.email}>{user?.email || 'Anonymous'}</Text>
      </View>

      <List.Section style={styles.settingsSection}>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          style={[styles.listItem, {backgroundColor: theme.colors.surface}]}
        />
      </List.Section>

      <Button
        mode="contained"
        onPress={onSignOut}
        style={styles.button}
        buttonColor={theme.colors.error}
      >
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  profileInfo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  settingsSection: {
      flex: 1,
      justifyContent: 'flex-start',
  },
  listItem: {
      borderRadius: 12,
  },
  avatar: {
    marginBottom: 20,
  },
  email: {
    marginBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 40,
  },
});

export default ProfileScreen;