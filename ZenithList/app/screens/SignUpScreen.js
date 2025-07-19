// app/screens/SignUpScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { handleSignUp } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Validation Regex ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState(''); // State for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);
  const theme = useTheme();

  const onSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
        setError("Please fill out all fields.");
        return;
    }
    if (username.length < 3) {
        setError("Username must be at least 3 characters long.");
        return;
    }
    if (!EMAIL_REGEX.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (!PASSWORD_REGEX.test(password)) {
        setError("Password must be at least 8 characters long and include an uppercase letter, a number, and a special character (@$!%*?&).");
        return;
    }

    setLoading(true);
    setError('');
    // Pass the username to the handleSignUp function
    const { user, error } = await handleSignUp(email, password, username);
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
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <Animatable.View animation="fadeIn" duration={1500}>
                <MaterialCommunityIcons name="account-plus-outline" size={100} color="#fff" />
              </Animatable.View>
              <Text variant="displayMedium" style={styles.title}>Create Account</Text>
              <Text variant="bodyLarge" style={styles.subtitle}>Start your journey</Text>
            </View>

            <Animatable.View animation="fadeInUp" duration={1000} delay={500} style={styles.formContainer}>
              <View style={styles.form}>
                {error ? <Text style={[styles.error, {color: theme.colors.error}]}>{error}</Text> : null}
                <TextInput
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="account-outline" />}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email-outline" />}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={isPasswordSecure}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)} />}
                />
                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={isConfirmPasswordSecure}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check-outline" />}
                    right={<TextInput.Icon icon={isConfirmPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)} />}
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
            </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
                Already have an account? <Text style={{color: '#fff', fontWeight: 'bold'}}>Login</Text>
            </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'space-between' },
  scrollViewContent: { flexGrow: 1, justifyContent: 'space-between' },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 15,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  form: { width: '100%' },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  button: {
    marginTop: 10,
    borderRadius: 30,
    elevation: 4
  },
  buttonContent: { paddingVertical: 10 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' },
  footer: { alignItems: 'center', paddingBottom: 40 },
  footerText: { color: 'rgba(255, 255, 255, 0.8)' },
  error: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 8,
    borderRadius: 8
  },
});

export default SignUpScreen;