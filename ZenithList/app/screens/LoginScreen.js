// app/screens/LoginScreen.js
import React, { useState, useContext, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { handleSignIn, handleAnonymousSignIn, handlePasswordReset } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // --- IMPORT THEME CONTEXT ---
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// --- Validation ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { dispatch } = useContext(AuthContext);
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext); // --- GET THEME MODE ---
  const formRef = useRef(null);

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError("Email address is required.");
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }
    
    if (!isValid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        formRef.current?.shake(800);
    }

    return isValid;
  };

  const onLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    const { user, error } = await handleSignIn(email, password);

    if (error) {
      setPasswordError("Invalid credentials. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      formRef.current?.shake(800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch({ type: 'SIGN_IN', payload: user });
    }
    setLoading(false);
  };

  const onForgotPassword = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address in the field above to reset your password.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    const { error } = await handlePasswordReset(email);
    setLoading(false);

    if (error) {
      Alert.alert("Error", "Could not send password reset email. Please check the email address and try again.");
    } else {
      Alert.alert("Check Your Email", "A password reset link has been sent to your email address.");
    }
  };

  const onAnonymousLogin = async () => {
    setLoading(true);
    const { user, error } = await handleAnonymousSignIn();
    if (error) {
        Alert.alert("Error", "Could not sign in as guest. Please try again later.");
    } else {
      dispatch({ type: 'SIGN_IN', payload: user });
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={theme.colors.headerGradient} // Use theme gradient
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Animatable.View animation="bounceIn" duration={1500} style={styles.logoContainer}>
              <MaterialCommunityIcons name="format-list-checks" size={100} color="#fff" />
            </Animatable.View>
            <Text variant="displayMedium" style={styles.title}>Welcome Back</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Sign in to Zenith List</Text>
          </View>

          <Animatable.View ref={formRef} animation="fadeInUp" duration={1000} delay={500} style={[styles.formContainer, {backgroundColor: theme.colors.surface}]}>
              <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email-outline" />}
                  error={!!emailError}
                  mode="outlined"
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>

              <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={isPasswordSecure}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)}/>}
                  error={!!passwordError}
                  mode="outlined"
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>

              <TouchableOpacity onPress={onForgotPassword}>
                  <Text style={[styles.forgotPasswordText, {color: theme.colors.primary}]}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                  mode="contained"
                  onPress={onLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
              >
                  Login
              </Button>
              <Button
                  onPress={onAnonymousLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.guestButton}
                  icon="incognito-circle"
                  textColor={theme.colors.placeholder}
              >
                  Continue as Guest
              </Button>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
       <View style={[styles.footer, {backgroundColor: 'transparent'}]}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            {/* --- MODIFIED TEXT --- */}
            <Text style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : theme.colors.placeholder }}>
                Don't have an account?{' '}
                <Text style={{ color: isDarkMode ? '#fff' : theme.colors.primary, fontWeight: 'bold' }}>
                    Sign Up
                </Text>
            </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    padding: 15,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  formContainer: {
    padding: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    marginTop: 5,
  },
  button: {
    marginTop: 15,
    borderRadius: 30,
    elevation: 4
  },
  buttonContent: { paddingVertical: 12 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' },
  guestButton: { marginTop: 15 },
  footer: { 
    alignItems: 'center',
    paddingVertical: 30,
  },
  // Removed color from here to apply it dynamically
  footerText: {}, 
  forgotPasswordText: {
    textAlign: 'right',
    marginBottom: 15,
    fontWeight: 'bold'
  },
});


export default LoginScreen;