// app/components/TaskItemSkeleton.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// A reusable shimmering View component
const Shimmer = () => {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = 0.6 + shimmerValue.value * 0.4; // Pulsate opacity
    return {
      opacity,
    };
  });

  return <Animated.View style={[styles.shimmer, animatedStyle]} />;
};

const TaskItemSkeleton = () => {
  const theme = useTheme();
  const skeletonBackgroundColor = theme.colors.surface;

  return (
    <View style={[styles.container, { backgroundColor: skeletonBackgroundColor }]}>
      <View style={styles.leftContainer}>
        <View style={[styles.priorityIndicator, { backgroundColor: theme.colors.placeholder }]} />
        <View style={[styles.checkbox, { borderColor: theme.colors.placeholder }]} />
      </View>
      <View style={styles.contentContainer}>
        <View style={[styles.line, { width: '80%' }]}><Shimmer /></View>
        <View style={[styles.line, { width: '50%', marginTop: 8 }]}><Shimmer /></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  priorityIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginLeft: 16,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
  },
  line: {
    height: 18,
    borderRadius: 4,
    overflow: 'hidden', // Important for shimmer effect
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E050', // A semi-transparent shimmer color
  },
});

export default TaskItemSkeleton;