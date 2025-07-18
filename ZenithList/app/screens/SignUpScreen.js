// app/screens/SignUpScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { handleSignUp } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);

  const onSignUp = async () => {
    setLoading(true);
    setError('');
    const { user, error } = await handleSignUp(email, password);
    if (error) {
      setError(error.message);
    } else {
      dispatch({ type: 'SIGN_IN', payload: user });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <Button mode="contained" onPress={onSignUp} loading={loading} style={styles.button}>
        Sign Up
      </Button>
      <Button onPress={() => navigation.navigate('Login')} style={styles.button}>
        Already have an account? Login
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

export default SignUpScreen;