// app/components/AddTaskModal.js
import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';

import { scheduleTaskNotification, scheduleTaskReminder } from '../notifications';
import SubtaskItem from './SubtaskItem';
import { Picker } from '@react-native-picker/picker';
import { generateTasksFromPrompt, addGeneratedTasks } from '../services/aiService';
import { AuthContext } from '../context/AuthContext';

// --- AI Configuration ---
const AI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = 'gpt-4-turbo';

const PriorityButton = ({ label, value, selectedValue, onSelect, color }) => {
    const theme = useTheme();
    const isSelected = value === selectedValue;
    return (
        <TouchableOpacity
            onPress={() => onSelect(value)}
            style={[
                styles.priorityButton,
                {
                    backgroundColor: isSelected ? color : theme.colors.background,
                    borderColor: isSelected ? color : theme.colors.placeholder,
                }
            ]}
        >
            <Text style={{color: isSelected ? '#fff' : theme.colors.text, fontWeight: isSelected ? 'bold' : 'normal'}}>{label}</Text>
        </TouchableOpacity>
    );
};

const AddTaskModal = ({ visible, onClose, onSave, taskToEdit }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [tags, setTags] = useState('');
  const [recurrence, setRecurrence] = useState({ frequency: 'none', interval: 1 });
  const [reminderDate, setReminderDate] = useState(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setDueDate(taskToEdit.dueDate?.toDate() || new Date());
      setSubtasks(taskToEdit.subtasks || []);
      setTags((taskToEdit.tags || []).join(', '));
      setRecurrence(taskToEdit.recurrence || { frequency: 'none', interval: 1 });
      setReminderDate(taskToEdit.reminderDate?.toDate() || null);
    } else {
      // Reset all fields for a new task
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date());
      setSubtasks([]);
      setTags('');
      setRecurrence({ frequency: 'none', interval: 1 });
      setReminderDate(null);
      setAiPrompt('');
    }
    setNewSubtask('');
  }, [taskToEdit, visible]);

  const handleGenerateTasks = async () => {
    if (!aiPrompt) {
      Alert.alert("Prompt Required", "Please enter a prompt to generate tasks.");
      return;
    }
    setIsGenerating(true);
    const apiKey = await SecureStore.getItemAsync('aiApiKey');
    if (!apiKey) {
      Alert.alert("API Key Required", "Please save your AI provider's API key in your profile.");
      setIsGenerating(false);
      return;
    }

    try {
      const generatedTasks = await generateTasksFromPrompt(aiPrompt, apiKey, AI_API_URL, AI_MODEL);
      if (generatedTasks.length > 0) {
        await addGeneratedTasks(user.uid, generatedTasks);
        Alert.alert("Success", `${generatedTasks.length} tasks have been generated and added to your list.`);
        onClose();
      } else {
        Alert.alert("No Tasks Generated", "The AI did not return any tasks. Please try a different prompt.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
        setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask.trim(), isCompleted: false }]);
        setNewSubtask('');
    }
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(subtasks.map(sub => sub.id === id ? { ...sub, isCompleted: !sub.isCompleted } : sub));
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for the task.');
      return;
    }
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    // Ensure interval is at least 1 when saving
    const finalRecurrence = {
        ...recurrence,
        interval: Number(recurrence.interval) || 1
    };

    const taskData = { title, description, priority, dueDate, subtasks, tags: tagsArray, recurrence: finalRecurrence, reminderDate };
    
    onSave(taskData);

    const taskId = taskToEdit?.id || Date.now().toString();
    scheduleTaskNotification({ id: taskId, ...taskData });
    if (reminderDate) {
      scheduleTaskReminder({ id: taskId, ...taskData }, reminderDate);
    }
    
    onClose();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  const onReminderDateChange = (event, selectedDate) => {
    setShowReminderPicker(false);
    if (event.type === 'set' && selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  // FIX: Allow interval input to be temporarily empty for a better UX
  const handleIntervalChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setRecurrence({ ...recurrence, interval: numericValue });
  };

  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <IconButton icon="close-circle" size={28} onPress={onClose} style={styles.closeButton} />
          <ScrollView contentContainerStyle={{width: '100%'}} showsVerticalScrollIndicator={false}>
            <Text variant="headlineMedium" style={styles.modalTitle}>
              {taskToEdit ? 'Edit Task' : 'New Task'}
            </Text>

            {!taskToEdit && (
              <>
                <View style={styles.aiSection}>
                  <TextInput
                    label="Or generate tasks with AI..."
                    value={aiPrompt}
                    onChangeText={setAiPrompt}
                    placeholder='e.g., "Plan a 3-day trip to the mountains"'
                    style={styles.input}
                    mode="outlined"
                    multiline
                  />
                  <Button
                    mode="contained-tonal"
                    onPress={handleGenerateTasks}
                    loading={isGenerating}
                    disabled={isGenerating}
                    icon="auto-fix"
                  >
                    Generate
                  </Button>
                </View>
                <Divider style={styles.divider}><Text>OR</Text></Divider>
              </>
            )}

            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
            <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} multiline mode="outlined" numberOfLines={3} />
            <TextInput 
              label="Tags (comma-separated)" 
              value={tags} 
              onChangeText={setTags} 
              style={styles.input} 
              mode="outlined" 
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
                <PriorityButton label="Low" value="Low" selectedValue={priority} onSelect={setPriority} color="#32CD32" />
                <PriorityButton label="Medium" value="Medium" selectedValue={priority} onSelect={setPriority} color="#FFD700" />
                <PriorityButton label="High" value="High" selectedValue={priority} onSelect={setPriority} color="#FF6347" />
            </View>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateButton, {borderColor: theme.colors.placeholder}]}>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.placeholder} style={{marginRight: 10}} />
              <Text>{`Due: ${format(dueDate, 'E, MMM d, yyyy')}`}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={dueDate} mode="date" display="default" onChange={onDateChange} />
            )}
            
            <TouchableOpacity onPress={() => setShowReminderPicker(true)} style={[styles.dateButton, {borderColor: theme.colors.placeholder}]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={theme.colors.placeholder} style={{marginRight: 10}} />
              <Text>{reminderDate ? `Reminder: ${format(reminderDate, 'E, MMM d, yyyy h:mm a')}` : 'Add a reminder'}</Text>
            </TouchableOpacity>

            {showReminderPicker && (
              <DateTimePicker 
                value={reminderDate || new Date()} 
                mode="datetime" 
                display="default" 
                onChange={onReminderDateChange} 
              />
            )}

            <Text style={styles.label}>Repeat</Text>
            <View style={[styles.recurrenceContainer, {borderColor: theme.colors.placeholder, backgroundColor: theme.colors.surface}]}>
              <Picker
                selectedValue={recurrence.frequency}
                style={{ flex: 1, color: theme.colors.text }}
                onValueChange={(itemValue) => setRecurrence({ ...recurrence, frequency: itemValue })}
                dropdownIconColor={theme.colors.placeholder}
              >
                <Picker.Item label="Never" value="none" color={theme.colors.text} />
                <Picker.Item label="Daily" value="daily" color={theme.colors.text} />
                <Picker.Item label="Weekly" value="weekly" color={theme.colors.text} />
                <Picker.Item label="Monthly" value="monthly" color={theme.colors.text} />
              </Picker>
              {recurrence.frequency !== 'none' && (
                <TextInput
                  label="Interval"
                  value={String(recurrence.interval)}
                  onChangeText={handleIntervalChange}
                  keyboardType="numeric"
                  style={{ width: 100, marginLeft: 10, backgroundColor: theme.colors.surface }}
                  mode="outlined"
                />
              )}
            </View>
            
            <Divider style={styles.divider} />

            <Text style={styles.label}>Subtasks</Text>
            {subtasks.map(item => (
                 <SubtaskItem
                    key={item.id}
                    subtask={item}
                    onToggle={() => handleToggleSubtask(item.id)}
                    onDelete={() => handleDeleteSubtask(item.id)}
                />
            ))}
            <TextInput
                label="Add a subtask..."
                value={newSubtask}
                onChangeText={setNewSubtask}
                style={styles.input}
                mode="outlined"
                right={<TextInput.Icon icon="plus" onPress={handleAddSubtask} />}
                onSubmitEditing={handleAddSubtask}
            />

            <Button mode="contained" onPress={handleSave} style={styles.saveButton} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel}>
              {taskToEdit ? 'Update Task' : 'Create Task'}
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end' },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 25,
    paddingBottom: 35,
    paddingTop: 45,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  modalTitle: { marginBottom: 25, textAlign: 'center', fontWeight: 'bold' },
  input: { marginBottom: 15, width: '100%' },
  label: { alignSelf: 'flex-start', marginLeft: 5, marginBottom: 8, fontSize: 16, opacity: 0.7 },
  priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  priorityButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      alignItems: 'center',
      marginHorizontal: 4,
  },
  dateButton: {
      width: '100%',
      padding: 16,
      borderWidth: 1,
      borderRadius: 4,
      alignItems: 'center',
      marginBottom: 20,
      flexDirection: 'row',
  },
  recurrenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 4,
  },
  divider: {
      marginVertical: 20,
  },
  aiSection: {
    marginBottom: 10,
  },
  saveButton: { borderRadius: 30, marginTop: 20 },
  buttonContent: { paddingVertical: 8 },
  buttonLabel: { fontSize: 16, fontWeight: 'bold' },
});

export default AddTaskModal;