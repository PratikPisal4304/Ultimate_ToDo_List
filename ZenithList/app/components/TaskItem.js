// app/components/TaskItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Checkbox, IconButton, useTheme, Text } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

const priorityColors = {
  High: '#FF6347',   // Tomato
  Medium: '#FFD700', // Gold
  Low: '#32CD32',    // LimeGreen
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();
  
  // Combine description and due date for a cleaner layout
  const descriptionText = [
    task.description,
    task.dueDate ? `Due ${formatDistanceToNow(task.dueDate.toDate(), { addSuffix: true })}` : ''
  ].filter(Boolean).join(' • ');

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <List.Item
      title={task.title}
      titleStyle={[styles.title, task.isCompleted && styles.completedText]}
      titleNumberOfLines={2}
      description={descriptionText}
      descriptionStyle={[styles.description, task.isCompleted && styles.completedText]}
      descriptionNumberOfLines={3}
      onPress={onEdit}
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
            <IconButton icon="trash-can-outline" size={24} onPress={onDelete} iconColor={theme.colors.error} />
        </View>
      )}
      style={[styles.listItem, { 
          backgroundColor: theme.colors.surface,
          opacity: task.isCompleted ? 0.7 : 1.0 // Fade out completed tasks
      }]}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
      fontWeight: 'bold',
  },
  description: {
      fontSize: 12,
  },
  completedText: {
      textDecorationLine: 'line-through',
      color: '#A9A9A9',
  },
  rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
});

export default React.memo(TaskItem);