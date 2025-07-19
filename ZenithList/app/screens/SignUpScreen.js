// app/screens/SignUpScreen.js
import React, { useState, useContext, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { handleSignUp } from '../firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // --- IMPORT THEME CONTEXT ---
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// --- Validation ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { dispatch } = useContext(AuthContext);
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext); // --- GET THEME MODE ---
  const formRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required.";
    else if (username.length < 3) newErrors.username = "Username must be at least 3 characters.";
    
    if (!email) newErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) newErrors.email = "Please enter a valid email.";
    
    if (!password) newErrors.password = "Password is required.";
    else if (!PASSWORD_REGEX.test(password)) newErrors.password = "Password must be 8+ characters with uppercase, number, and special character.";

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        formRef.current?.shake(800);
        return false;
    }
    return true;
  };


  const onSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    const { user, error } = await handleSignUp(email, password, username);
    if (error) {
      const newErrors = {};
      if (error.code === 'auth/email-already-in-use') {
        newErrors.email = "This email address is already in use.";
      } else {
        newErrors.general = "Could not create account. Please try again.";
      }
      setErrors(newErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
              <Animatable.View animation="fadeIn" duration={1500} style={styles.logoContainer}>
                <MaterialCommunityIcons name="account-plus-outline" size={100} color="#fff" />
              </Animatable.View>
              <Text variant="displayMedium" style={styles.title}>Create Account</Text>
              <Text variant="bodyLarge" style={styles.subtitle}>Start your journey to peak productivity</Text>
            </View>

            <Animatable.View ref={formRef} animation="fadeInUp" duration={1000} delay={500} style={[styles.formContainer, {backgroundColor: theme.colors.surface}]}>
                {errors.general && <HelperText type="error" visible={true} style={{textAlign: 'center'}}>{errors.general}</HelperText>}
                <TextInput
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="account-outline" />}
                    error={!!errors.username}
                    mode="outlined"
                />
                <HelperText type="error" visible={!!errors.username}>{errors.username}</HelperText>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email-outline" />}
                    error={!!errors.email}
                    mode="outlined"
                />
                <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={isPasswordSecure}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)} />}
                    error={!!errors.password}
                    mode="outlined"
                />
                <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={isConfirmPasswordSecure}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check-outline" />}
                    right={<TextInput.Icon icon={isConfirmPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)} />}
                    error={!!errors.confirmPassword}
                    mode="outlined"
                />
                <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword}</HelperText>
                
                <Button
                    mode="contained"
                    onPress={onSignUp}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    Sign Up
                </Button>
            </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, {backgroundColor: 'transparent'}]}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            {/* --- MODIFIED TEXT --- */}
            <Text style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : theme.colors.placeholder }}>
                Already have an account?{' '}
                <Text style={{ color: isDarkMode ? '#fff' : theme.colors.primary, fontWeight: 'bold' }}>
                    Login
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
    textAlign: 'center'
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
  footer: { 
    alignItems: 'center', 
    paddingVertical: 30 
  },
  // Removed color from here to apply it dynamically
  footerText: {},
});


export default SignUpScreen;