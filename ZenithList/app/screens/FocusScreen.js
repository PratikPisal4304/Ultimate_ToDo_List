// app/screens/FocusScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Text, Button, useTheme, IconButton } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes in seconds

const FocusScreen = ({ route, navigation }) => {
  useKeepAwake();
  const theme = useTheme();
  const { task } = route.params;

  const [totalSeconds, setTotalSeconds] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef(null);

  const cleanupInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (totalSeconds === 0 && !isFinished) {
      setIsActive(false);
      setIsFinished(true);
      cleanupInterval();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // You could play a sound or show a completion message here
    }

    return cleanupInterval;
  }, [isActive, totalSeconds, isFinished]);

  const toggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
    if(isFinished) setIsFinished(false);
  }, [isActive, isFinished]);

  const resetTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cleanupInterval();
    setIsActive(false);
    setIsFinished(false);
    setTotalSeconds(FOCUS_TIME_SECONDS);
  }, []);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = ((FOCUS_TIME_SECONDS - totalSeconds) / FOCUS_TIME_SECONDS) * 100;

  return (
    <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.container}
    >
      <IconButton
        icon="close"
        size={30}
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
        iconColor={theme.colors.placeholder}
      />
      <View style={styles.content}>
        <Text style={styles.taskTitle}>Focusing on:</Text>
        <Text style={styles.taskName}>{task.title}</Text>

        <AnimatedCircularProgress
          size={280}
          width={15}
          fill={progress}
          tintColor={isFinished ? theme.colors.disabled : theme.colors.primary}
          backgroundColor={theme.colors.surface}
          padding={10}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Text style={styles.timer}>
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
          >
            Reset
          </Button>
          <Button
            mode="contained"
            onPress={toggleTimer}
            style={[styles.controlButton, { backgroundColor: isActive ? theme.colors.error : theme.colors.primary }]}
            labelStyle={styles.controlButtonLabel}
            icon={isActive ? 'pause' : 'play'}
          >
            {isFinished ? 'Start Again' : (isActive ? 'Pause' : 'Start')}
          </Button>
        </View>
      </View>
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
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  taskTitle: {
    fontSize: 22,
    color: '#a3a3a3',
  },
  taskName: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 60,
  },
  timer: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#fff',
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