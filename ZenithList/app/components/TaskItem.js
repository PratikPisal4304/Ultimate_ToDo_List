// app/components/TaskItem.js
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { List, Checkbox, IconButton, useTheme, Text } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';

const priorityColors = {
  High: '#FF6347',   // Tomato
  Medium: '#FFD700', // Gold
  Low: '#32CD32',    // LimeGreen
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();
  
  const descriptionText = [
    task.description,
    task.dueDate ? `Due ${formatDistanceToNow(task.dueDate.toDate(), { addSuffix: true })}` : ''
  ].filter(Boolean).join(' • ');

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.rightActionContainer, { transform: [{ translateX: trans }] }]}>
        <IconButton
          icon="pencil"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onEdit}
          style={styles.actionButton}
        />
        <IconButton
          icon="trash-can-outline"
          iconColor={theme.colors.error}
          size={24}
          onPress={onDelete}
          style={styles.actionButton}
        />
      </Animated.View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
        <List.Item
          title={task.title}
          titleStyle={[styles.title, task.isCompleted && styles.completedText]}
          titleNumberOfLines={2}
          description={descriptionText}
          descriptionStyle={[styles.description, task.isCompleted && styles.completedText]}
          descriptionNumberOfLines={3}
          onPress={onEdit} // Keep this for accessibility
          left={() => (
            <View style={styles.leftContainer}>
                <View style={[styles.priorityIndicator, { backgroundColor: task.isCompleted ? theme.colors.disabled : priorityColors[task.priority] }]} />
                <Checkbox.Android
                    status={task.isCompleted ? 'checked' : 'unchecked'}
                    onPress={handleToggle}
                    color={theme.colors.primary}
                />
            </View>
          )}
          right={() => (
            <View style={styles.rightContainer}>
                {!task.isCompleted && <IconButton icon="brain" size={24} onPress={onFocus} />}
            </View>
          )}
          style={[styles.listItem, { 
              backgroundColor: theme.colors.surface,
              opacity: task.isCompleted ? 0.6 : 1.0
          }]}
        />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  listItem: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 6,
    height: '80%',
    borderRadius: 3,
    marginRight: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 16, // Increased font size
  },
  description: {
    fontSize: 13, // Slightly increased
    color: '#A9A9A9', // Softer color
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  actionButton: {
    marginHorizontal: 5,
  }
});

export default React.memo(TaskItem);