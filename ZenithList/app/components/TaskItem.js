// app/components/TaskItem.js
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { List, Checkbox, IconButton, useTheme, Text } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const priorityColors = {
  High: '#FF6347',   // Tomato
  Medium: '#FFD700', // Gold
  Low: '#32CD32',    // LimeGreen
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, onFocus }) => {
  const theme = useTheme();

  const descriptionText = task.description ? task.description : '';
  const dueDateText = task.dueDate ? `Due ${formatDistanceToNow(task.dueDate.toDate(), { addSuffix: true })}` : '';

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
          description={() => (
            <View>
              {descriptionText ? <Text style={[styles.description, task.isCompleted && styles.completedText]} numberOfLines={3}>{descriptionText}</Text> : null}
              {dueDateText ? <Text style={[styles.dueDate, task.isCompleted && styles.completedText]}>{dueDateText}</Text> : null}
            </View>
          )}
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
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  }
});

export default React.memo(TaskItem);