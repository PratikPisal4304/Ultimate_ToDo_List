// app/screens/FocusScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';

const FOCUS_TIME_MINUTES = 25;

const FocusScreen = ({ route, navigation }) => {
  useKeepAwake(); // Prevents the screen from sleeping
  const { task } = route.params;
  const [minutes, setMinutes] = useState(FOCUS_TIME_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s === 0) {
            setMinutes((m) => {
              if (m === 0) {
                // Timer finished
                clearInterval(intervalRef.current);
                setIsActive(false);
                alert("Focus session complete! Time to take a break.");
                // Here you could play a sound
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);
  
  const stopSession = () => {
    clearInterval(intervalRef.current);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.taskTitle}>Focusing on:</Text>
      <Text style={styles.taskName}>{task.title}</Text>
      <Text style={styles.timer}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <Button mode="outlined" onPress={stopSession} style={styles.stopButton}>
        Stop Session
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
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
    marginBottom: 40,
  },
  timer: {
    fontSize: 90,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 60,
  },
  stopButton: {
    borderColor: '#ff4d4d',
  },
});

export default FocusScreen;