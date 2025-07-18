// app/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { handleSignOut } from '../firebase/auth';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);

  const onSignOut = () => {
    handleSignOut();
  };

  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label={user?.email?.[0].toUpperCase() || 'A'} style={styles.avatar} />
      <Text variant="titleLarge" style={styles.email}>{user?.email || 'Anonymous'}</Text>
      <Button mode="contained" onPress={onSignOut} style={styles.button}>
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  avatar: { marginBottom: 20 },
  email: { marginBottom: 20 },
  button: { width: '100%' },
});
export default ProfileScreen;