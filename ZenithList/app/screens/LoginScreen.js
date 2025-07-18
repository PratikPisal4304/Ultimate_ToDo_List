// app/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { handleSignIn, handleAnonymousSignIn } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);
  const theme = useTheme();

  const onLogin = async () => {
    if (!email || !password) {
        setError("Please enter both email and password.");
        return;
    }
    setLoading(true);
    setError('');
    const { user, error } = await handleSignIn(email, password);
    if (error) {
      setError("Invalid credentials. Please try again.");
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
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="format-list-checks" size={80} color={theme.colors.primary} />
        <Text variant="displaySmall" style={styles.title}>Zenith List</Text>
        <Text variant="bodyLarge" style={{color: theme.colors.placeholder}}>Reach your peak productivity</Text>
      </View>
      
      <View style={styles.form}>
        {error ? <Text style={[styles.error, {color: theme.colors.error}]}>{error}</Text> : null}
        <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
        />
        <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
        />
        <Button 
            mode="contained" 
            onPress={onLogin} 
            loading={loading} 
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
        >
            Login
        </Button>
        <Button 
            onPress={onAnonymousLogin} 
            loading={loading} 
            style={styles.guestButton} 
            icon="incognito"
            textColor={theme.colors.placeholder}
        >
            Continue as Guest
        </Button>
      </View>
      
      <View style={styles.footer}>
        <Button onPress={() => navigation.navigate('SignUp')}>
            Don't have an account? <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>Sign Up</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 20 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginTop: 10 },
  form: { width: '100%' },
  input: { marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.05)' },
  button: { marginTop: 10, borderRadius: 30 },
  buttonContent: { paddingVertical: 8 },
  buttonLabel: { fontSize: 16, fontWeight: 'bold' },
  guestButton: { marginTop: 15 },
  footer: { alignItems: 'center', paddingBottom: 20 },
  error: { textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
});

export default LoginScreen;
