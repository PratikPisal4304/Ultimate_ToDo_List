// app/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { handleSignIn, handleAnonymousSignIn } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);

  const onLogin = async () => {
    setLoading(true);
    setError('');
    const { user, error } = await handleSignIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      dispatch({ type: 'SIGN_IN', payload: user });
    }
    setLoading(false);
  };

  const onAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    const { user, error } = await handleAnonymousSignIn();
    if (error) {
      setError(error.message);
    } else {
      dispatch({ type: 'SIGN_IN', payload: user });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Zenith List</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={onLogin} loading={loading} style={styles.button}>
        Login
      </Button>
      <Button onPress={() => navigation.navigate('SignUp')} style={styles.button}>
        Don't have an account? Sign Up
      </Button>
      <Button onPress={onAnonymousLogin} loading={loading} style={styles.button} icon="incognito">
        Continue as Guest
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default LoginScreen;