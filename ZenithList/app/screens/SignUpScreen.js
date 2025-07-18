// app/screens/SignUpScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { handleSignUp } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);
  const theme = useTheme();

  const onSignUp = async () => {
    if (!email || !password) {
        setError("Please fill out all fields.");
        return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setLoading(true);
    setError('');
    const { user, error } = await handleSignUp(email, password);
    if (error) {
        if (error.code === 'auth/email-already-in-use') {
            setError("The email address is already in use by another account.");
        } else {
            setError("Could not create account. Please try again.");
        }
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
        <MaterialCommunityIcons name="account-plus" size={80} color={theme.colors.primary} />
        <Text variant="displaySmall" style={styles.title}>Create Account</Text>
        <Text variant="bodyLarge" style={{color: theme.colors.placeholder}}>Start your journey</Text>
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
            onPress={onSignUp}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
        >
            Sign Up
        </Button>
      </View>

      <View style={styles.footer}>
        <Button onPress={() => navigation.navigate('Login')}>
            Already have an account? <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>Login</Text>
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
  footer: { alignItems: 'center', paddingBottom: 20 },
  error: { textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
});

export default SignUpScreen;