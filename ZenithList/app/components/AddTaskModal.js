// app/components/AddTaskModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, useTheme, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const AddTaskModal = ({ visible, onClose, onSave, taskToEdit }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setDueDate(taskToEdit.dueDate?.toDate() || new Date());
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date());
    }
  }, [taskToEdit, visible]); // also reset on visible

  const handleSave = () => {
    if (!title) {
      alert('Title is required!');
      return;
    }
    onSave({ title, description, priority, dueDate });
    onClose();
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios'); // on iOS, the picker is a modal itself
    setDueDate(currentDate);
  };

  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <IconButton
            icon="close-circle"
            size={28}
            onPress={onClose}
            style={styles.closeButton}
          />
          <Text variant="headlineMedium" style={styles.modalTitle}>
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </Text>
          
          <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            mode="outlined"
          />
          
          <Text style={styles.label}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={setPriority}
            density="medium"
            buttons={[
              { value: 'Low', label: 'Low', style: {backgroundColor: priority === 'Low' ? '#32CD32' : theme.colors.background} },
              { value: 'Medium', label: 'Medium', style: {backgroundColor: priority === 'Medium' ? '#FFD700' : theme.colors.background} },
              { value: 'High', label: 'High', style: {backgroundColor: priority === 'High' ? '#FF6347' : theme.colors.background} },
            ]}
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateButton, {borderColor: theme.colors.placeholder}]}>
            <Text>{`Due: ${format(dueDate, 'E, MMM d, yyyy')}`}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              textColor={theme.colors.text} // For iOS dark mode
            />
          )}

          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {taskToEdit ? 'Update Task' : 'Create Task'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    paddingTop: 45,
    width: '100%',
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
