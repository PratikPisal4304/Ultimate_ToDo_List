// app/components/AddTaskModal.js
import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { TasksContext } from '../context/TasksContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { scheduleTaskNotification } from '../notifications'; // <-- Import notification scheduler

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
  const { projects } = useContext(TasksContext); // Get projects from context
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [projectId, setProjectId] = useState(null); // New state for project ID
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToToEdit.priority || 'Medium');
      setDueDate(taskToEdit.dueDate?.toDate() || new Date());
      setProjectId(taskToEdit.projectId || null);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date());
      setProjectId(null);
    }
  }, [taskToEdit, visible]);

  const handleSave = () => {
    if (!title) {
      alert('Title is required!');
      return;
    }
    const taskData = { title, description, priority, dueDate, projectId };
    onSave(taskData);
    // Schedule a notification for the task
    scheduleTaskNotification({
        id: taskToEdit?.id || Date.now().toString(), // Use existing ID or a temporary one
        ...taskData
    });
    onClose();
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const selectedProject = projects.find(p => p.id === projectId) || { name: 'No Project', color: theme.colors.placeholder };

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

            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
            <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} multiline mode="outlined" numberOfLines={3} />

            {/* Project Selector */}
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                    <Button
                        onPress={() => setMenuVisible(true)}
                        icon={() => <MaterialCommunityIcons name="circle" color={selectedProject.color} size={14} />}
                        mode="outlined"
                        style={styles.input}
                    >
                        {selectedProject.name}
                    </Button>
                }
            >
                <Menu.Item onPress={() => { setProjectId(null); setMenuVisible(false); }} title="No Project" />
                {projects.filter(p => p.id !== 'all').map(p => (
                    <Menu.Item key={p.id} onPress={() => { setProjectId(p.id); setMenuVisible(false); }} title={p.name} />
                ))}
            </Menu>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
                <PriorityButton label="Low" value="Low" selectedValue={priority} onSelect={setPriority} color="#32CD32" />
                <PriorityButton label="Medium" value="Medium" selectedValue={priority} onSelect={setPriority} color="#FFD700" />
                <PriorityButton label="High" value="High" selectedValue={priority} onSelect={setPriority} color="#FF6347" />
            </View>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateButton, {borderColor: theme.colors.placeholder}]}>
              <Text>{`Due: ${format(dueDate, 'E, MMM d, yyyy')}`}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={dueDate} mode="date" display="default" onChange={onDateChange} textColor={theme.colors.text} />
            )}

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
    backgroundColor: '#1E1E1E',
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
  label: { alignSelf: 'flex-start', marginLeft: 5, marginBottom: 8, color: '#A9A9A9' },
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
  },
  saveButton: { borderRadius: 30 },
  buttonContent: { paddingVertical: 8 },
  buttonLabel: { fontSize: 16, fontWeight: 'bold' },
});

export default AddTaskModal;