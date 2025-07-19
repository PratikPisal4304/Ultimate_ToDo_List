// app/screens/FocusScreen.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Text, Button, useTheme, IconButton } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { ThemeContext } from '../context/ThemeContext';


const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes in seconds

const FocusScreen = ({ route, navigation }) => {
  useKeepAwake(); // Prevents the screen from sleeping during a focus session
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  const { task } = route.params;

  const [totalSeconds, setTotalSeconds] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const pausedTimestamp = useRef(null);

  // --- Animation Setup for background ---
  const breath = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: breath.value,
  }));

  useEffect(() => {
    // Start or stop the breathing animation based on timer state
    if (isActive) {
      breath.value = withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.bezier(0.45, 0, 0.55, 1) }),
        -1,
        true
      );
    } else {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 1000 });
    }

    return () => cancelAnimation(breath);
  }, [isActive]);


  // --- App State Handling ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (isActive && pausedTimestamp.current) {
          const blurredSeconds = Math.floor((Date.now() - pausedTimestamp.current) / 1000);
          setTotalSeconds(prevSeconds => Math.max(0, prevSeconds - blurredSeconds));
          pausedTimestamp.current = null;
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        if (isActive) {
          pausedTimestamp.current = Date.now();
          cleanupInterval(); // Stop the interval
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  const cleanupInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Main timer logic
  useEffect(() => {
    if (isActive && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (totalSeconds <= 0) {
      if (isActive) { // Only trigger finish if it was running
        setIsActive(false);
        setIsFinished(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      cleanupInterval();
    }
    return cleanupInterval;
  }, [isActive, totalSeconds]);


  const resetTimer = useCallback(() => {
    cleanupInterval();
    setIsActive(false);
    setIsFinished(false);
    setTotalSeconds(FOCUS_TIME_SECONDS);
  }, []);

  const toggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFinished) {
      resetTimer();
      setTimeout(() => setIsActive(true), 100);
    } else {
      setIsActive(!isActive);
    }
  }, [isActive, isFinished, resetTimer]);


  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = ((FOCUS_TIME_SECONDS - totalSeconds) / FOCUS_TIME_SECONDS) * 100;
  
  const progressColor = isFinished ? '#4CAF50' : (isActive ? theme.colors.primary : theme.colors.placeholder);
  const mainButtonIcon = isFinished ? 'replay' : (isActive ? 'pause' : 'play');
  const mainButtonText = isFinished ? 'Restart' : (isActive ? 'Pause' : 'Start');


  return (
    <LinearGradient
        colors={isDarkMode ? ['#0D0D0D', '#1A1A1A'] : ['#F7F7F7', '#FFFFFF']}
        style={styles.container}
    >
      {/* Animated background layer */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <LinearGradient colors={[theme.colors.primary, 'transparent']} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Main content layer */}
      <View style={styles.content}>
        <Text style={[styles.taskTitle, { color: theme.colors.placeholder }]}>Focusing on:</Text>
        <Text style={[styles.taskName, { color: theme.colors.text }]}>{task.title}</Text>

        <AnimatedCircularProgress
          size={280}
          width={15}
          fill={progress}
          tintColor={progressColor}
          backgroundColor={theme.colors.surface}
          padding={10}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Text style={[styles.timer, { color: theme.colors.text }]}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          )}
        </AnimatedCircularProgress>

        <View style={styles.controls}>
          <Button
            mode="outlined"
            onPress={resetTimer}
            style={styles.controlButton}
            labelStyle={styles.controlButtonLabel}
            icon="restart"
          >
            Reset
          </Button>
          <Button
            mode="contained"
            onPress={toggleTimer}
            style={[styles.controlButton, { backgroundColor: isActive ? theme.colors.error : theme.colors.primary }]}
            labelStyle={styles.controlButtonLabel}
            icon={mainButtonIcon}
          >
            {mainButtonText}
          </Button>
        </View>
      </View>
      
      {/* FIX: Close button is now the last element, ensuring it's on top of other elements */}
      <IconButton
        icon="close"
        size={30}
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
        iconColor={theme.colors.placeholder}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10, // Increased zIndex to be safe
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  taskTitle: {
    fontSize: 22,
  },
  taskName: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 60,
  },
  timer: {
    fontSize: 70,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 60,
    width: '100%',
  },
  controlButton: {
    width: '45%',
    borderRadius: 30,
  },
  controlButtonLabel: {
    fontSize: 18,
    paddingVertical: 8,
  }
});

export default FocusScreen;