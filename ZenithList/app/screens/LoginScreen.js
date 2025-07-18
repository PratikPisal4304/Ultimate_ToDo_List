// app/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
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
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Animatable.View animation="bounceIn" duration={1500}>
            <MaterialCommunityIcons name="format-list-checks" size={100} color="#fff" />
          </Animatable.View>
          <Text variant="displayMedium" style={styles.title}>Zenith List</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Reach your peak productivity</Text>
        </View>

        <Animatable.View animation="fadeInUp" duration={1000} delay={500} style={styles.formContainer}>
          <View style={styles.form}>
            {error ? <Text style={[styles.error, {color: theme.colors.error}]}>{error}</Text> : null}
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
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" />}
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
                icon="incognito-circle-off"
                textColor={theme.colors.placeholder}
            >
                Continue as Guest
            </Button>
          </View>
        </Animatable.View>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerText}>
                Don't have an account? <Text style={{color: '#fff', fontWeight: 'bold'}}>Sign Up</Text>
            </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'space-between' },
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
  guestButton: { marginTop: 15 },
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

export default LoginScreen;