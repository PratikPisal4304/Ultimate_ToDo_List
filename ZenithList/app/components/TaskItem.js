// app/components/TaskItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Checkbox, IconButton, useTheme } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';

const priorityColors = {
  High: '#FF6347',   // Tomato
  Medium: '#FFD700', // Gold
  Low: '#32CD32',    // LimeGreen
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();
  
  const description = [];
  if (task.description) {
      description.push(task.description);
  }
  if (task.dueDate) {
      const due = task.dueDate.toDate();
      const dueText = `Due ${formatDistanceToNow(due, { addSuffix: true })}`;
      description.push(dueText);
  }

  return (
    <List.Item
      title={task.title}
      titleStyle={[styles.title, task.isCompleted && styles.completedTitle]}
      titleNumberOfLines={2}
      description={description.join(' • ')}
      descriptionStyle={task.isCompleted && styles.completedTitle}
      descriptionNumberOfLines={3}
      onPress={onEdit}
      left={() => (
        <View style={styles.leftContainer}>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[task.priority] }]} />
            <Checkbox.Android
                status={task.isCompleted ? 'checked' : 'unchecked'}
                onPress={onToggle}
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
      style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
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
  },
  leftContainer: {
      flexDirection: 'row',
      alignItems: 'center'
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
  completedTitle: {
      textDecorationLine: 'line-through',
      color: '#A9A9A9',
  },
  rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  }
});

export default React.memo(TaskItem);