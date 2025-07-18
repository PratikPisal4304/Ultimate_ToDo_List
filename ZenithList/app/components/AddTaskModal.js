// app/components/AddTaskModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const AddTaskModal = ({ visible, onClose, onSave, taskToEdit }) => {
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
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date());
    }
  }, [taskToEdit]);

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
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
      <View style={styles.modalView}>
        <Text variant="headlineSmall" style={styles.modalTitle}>
          {taskToEdit ? 'Edit Task' : 'Add New Task'}
        </Text>
        <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
        />
        <Text style={styles.label}>Priority</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ]}
          style={styles.input}
        />
        <Button icon="calendar" onPress={() => setShowDatePicker(true)} style={styles.input}>
          Due Date: {format(dueDate, 'PPP')}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Save Task
        </Button>
        <Button onPress={onClose}>Cancel</Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: { marginBottom: 15, textAlign: 'center' },
  input: { marginBottom: 10, width: '100%' },
  label: { alignSelf: 'flex-start', marginLeft: 5, marginTop: 5 },
  saveButton: { marginTop: 10, width: '100%' },
});

export default AddTaskModal;