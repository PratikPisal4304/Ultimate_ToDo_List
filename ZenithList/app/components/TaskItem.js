// app/components/TaskItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Checkbox, IconButton, Text, useTheme } from 'react-native-paper';
import { format } from 'date-fns';

const priorityColors = {
  High: '#ff4d4d',
  Medium: '#ffa500',
  Low: '#4caf50',
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();
  
  return (
    <List.Item
      title={task.title}
      titleNumberOfLines={2}
      description={task.description}
      descriptionNumberOfLines={3}
      onPress={onEdit}
      left={() => (
        <Checkbox.Android
          status={task.isCompleted ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={theme.colors.primary}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
            <IconButton icon="brain" size={24} onPress={onFocus} />
            <IconButton icon="trash-can-outline" size={24} onPress={onDelete} iconColor={theme.colors.error} />
        </View>
      )}
      style={[styles.listItem, { borderLeftColor: priorityColors[task.priority] }]}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#2c2c2c',
    borderLeftWidth: 5,
  },
  rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  }
});

export default TaskItem;