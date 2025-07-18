// app/components/TaskItem.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Checkbox, IconButton, useTheme, Text, Divider } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import SubtaskItem from './SubtaskItem';
import * as FirestoreService from '../firebase/firestore';
import { AuthContext } from '../context/AuthContext';

const priorityColors = {
  High: '#FF6347',
  Medium: '#FFD700',
  Low: '#32CD32',
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const descriptionText = task.description ? task.description : '';
  const dueDateText = task.dueDate ? `Due ${formatDistanceToNow(task.dueDate.toDate(), { addSuffix: true })}` : '';

  const handleToggleSubtask = (subtaskId) => {
    const updatedSubtasks = task.subtasks.map(sub =>
      sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
    );
    FirestoreService.updateTask(user.uid, task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId) => {
      const updatedSubtasks = task.subtasks.filter(sub => sub.id !== subtaskId);
      FirestoreService.updateTask(user.uid, task.id, { subtasks: updatedSubtasks });
  };

  const renderRightActions = () => (
    <View style={styles.rightActionContainer}>
        <IconButton icon="pencil" onPress={onEdit} style={styles.actionButton} iconColor="#fff" backgroundColor={theme.colors.primary}/>
        <IconButton icon="delete" onPress={onDelete} style={styles.actionButton} iconColor="#fff" backgroundColor={theme.colors.error}/>
    </View>
  );

  const subtasksExist = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = subtasksExist ? task.subtasks.filter(s => s.isCompleted).length : 0;

  return (
    <Swipeable renderRightActions={renderRightActions}>
        <List.Item
          title={task.title}
          titleStyle={[styles.title, task.isCompleted && styles.completedText]}
          titleNumberOfLines={2}
          description={() => (
            <View>
              {descriptionText ? <Text style={[styles.description, task.isCompleted && styles.completedText]} numberOfLines={3}>{descriptionText}</Text> : null}
              {dueDateText ? <Text style={[styles.dueDate, task.isCompleted && styles.completedText]}>{dueDateText}</Text> : null}
              {subtasksExist && (
                <Text style={styles.subtaskCounter}>
                  {`\nSubtasks: ${completedSubtasks} / ${task.subtasks.length}`}
                </Text>
              )}
              {task.tags && task.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {task.tags.map(tag => (
                    <Text key={tag} style={[styles.tag, { backgroundColor: theme.colors.primary + '33', color: theme.colors.primary }]}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          onPress={onEdit}
          left={() => (
            <View style={styles.leftContainer}>
                <View style={[styles.priorityIndicator, { backgroundColor: task.isCompleted ? theme.colors.disabled : priorityColors[task.priority] }]} />
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
            </View>
          )}
          style={[styles.listItem, { backgroundColor: theme.colors.surface, opacity: task.isCompleted ? 0.6 : 1.0 }]}
        />
        {subtasksExist && (
            <View style={[styles.subtasksContainer, {backgroundColor: theme.colors.surface}]}>
                <Divider />
                {task.subtasks.map(subtask => (
                    <SubtaskItem
                        key={subtask.id}
                        subtask={subtask}
                        onToggle={() => handleToggleSubtask(subtask.id)}
                        onDelete={() => handleDeleteSubtask(subtask.id)}
                    />
                ))}
            </View>
        )}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  listItem: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtasksContainer: {
    marginHorizontal: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  subtaskCounter: {
    fontSize: 12,
    color: '#A9A9A9',
    fontStyle: 'italic',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  priorityIndicator: {
    width: 6,
    height: '80%',
    borderRadius: 3,
    marginRight: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  dueDate: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 4,
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
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
});

export default React.memo(TaskItem);