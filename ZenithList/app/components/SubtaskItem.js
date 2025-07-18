// app/components/SubtaskItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text, useTheme, IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

const SubtaskItem = ({ subtask, onToggle, onDelete }) => {
  const theme = useTheme();
  const { title, isCompleted } = subtask;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
  };

  return (
    <View style={styles.container}>
      <Checkbox.Android
        status={isCompleted ? 'checked' : 'unchecked'}
        onPress={handleToggle}
        color={theme.colors.primary}
      />
      <Text
        style={[
          styles.title,
          { color: theme.colors.text },
          isCompleted && styles.completedText,
        ]}
      >
        {title}
      </Text>
      <IconButton icon="close-circle-outline" size={20} onPress={handleDelete} style={styles.deleteButton} iconColor={theme.colors.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 48, // Indent subtasks
    marginVertical: 2,
  },
  title: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    margin: 0,
  }
});

export default React.memo(SubtaskItem);