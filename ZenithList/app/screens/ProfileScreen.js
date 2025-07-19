// app/screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar, List, Switch, useTheme, Card, TextInput } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { handleSignOut } from '../firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY_NAME = 'aiApiKey';

const ProfileScreen = ({ navigation }) => { // Added navigation prop
  const { user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    // Check if a key is already saved
    SecureStore.getItemAsync(API_KEY_NAME).then(key => {
      if (key) {
        setIsKeySaved(true);
      }
    });
  }, []);

  const saveApiKey = async () => {
    if (apiKey) {
      await SecureStore.setItemAsync(API_KEY_NAME, apiKey);
      setApiKey('');
      setIsKeySaved(true);
      Alert.alert("Success", "API Key saved securely.");
    } else {
      Alert.alert("Error", "Please enter an API key.");
    }
  };

  const clearApiKey = async () => {
    await SecureStore.deleteItemAsync(API_KEY_NAME);
    setIsKeySaved(false);
    Alert.alert("Success", "API Key cleared.");
  };

  const onSignOut = () => {
    handleSignOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
            colors={[theme.colors.primary, '#6A5ACD99']}
            style={styles.header}
        >
            <Avatar.Text size={90} label={user?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'G'} style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.username}>{user?.displayName || 'Guest User'}</Text>
            <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
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

        {/* --- NEW SECTION FOR APP GUIDE --- */}
        <List.Section style={styles.settingsSection}>
            <List.Subheader style={styles.subheader}>Help</List.Subheader>
            <List.Item
              title="How to Use Zenith List"
              description="Learn about all the features."
              left={() => <List.Icon icon="help-circle-outline" />}
              onPress={() => navigation.navigate('HowToUse')}
              style={[styles.listItem, {backgroundColor: theme.colors.surface}]}
            />
        </List.Section>

        <List.Section style={styles.settingsSection}>
          <List.Subheader style={styles.subheader}>AI Task Manager</List.Subheader>
          <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            <Card.Content>
              <Text style={styles.cardTitle}>AI Provider API Key</Text>
              {isKeySaved ? (
                <View>
                  <Text style={styles.apiKeyStatus}>API Key is saved securely.</Text>
                  <Button mode="outlined" onPress={clearApiKey} textColor={theme.colors.error} style={{marginTop: 10}}>Clear Key</Button>
                </View>
              ) : (
                <View>
                  <TextInput
                    label="Enter your API Key"
                    value={apiKey}
                    onChangeText={setApiKey}
                    secureTextEntry
                    style={styles.input}
                  />
                  <Button mode="contained" onPress={saveApiKey} style={{marginTop: 10}}>Save Key</Button>
                </View>
              )}
            </Card.Content>
          </Card>
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
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
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
  card: {
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  apiKeyStatus: {
    fontStyle: 'italic',
    color: 'green',
  },
  input: {
    backgroundColor: 'transparent',
  }
});

export default ProfileScreen;