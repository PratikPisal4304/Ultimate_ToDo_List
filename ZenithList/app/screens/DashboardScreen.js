// app/screens/DashboardScreen.js
import React, { useState, useContext, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, SegmentedButtons, ActivityIndicator, Appbar } from 'react-native-paper';
import { isToday, isWithinInterval, addDays } from 'date-fns';
import { scheduleTaskNotification } from '../notifications';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';
import * as FirestoreService from '../firebase/firestore';
import { useEffect } from 'react';

import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { tasks, userData, loading } = useContext(TasksContext);

  const [filter, setFilter] = useState('All'); // All, Today, Upcoming, Completed
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const filteredTasks = useMemo(() => {
    const now = new Date();
    switch (filter) {
      case 'Today':
        return tasks.filter(t => !t.isCompleted && t.dueDate && isToday(t.dueDate.toDate()));
      case 'Upcoming':
        return tasks.filter(t => !t.isCompleted && t.dueDate && isWithinInterval(t.dueDate.toDate(), { start: now, end: addDays(now, 7) }));
      case 'Completed':
        return tasks.filter(t => t.isCompleted);
      case 'All':
      default:
        return tasks.filter(t => !t.isCompleted);
    }
  }, [tasks, filter]);

    const handleSaveTask = async (taskData) => {
        if (taskToEdit) {
        await FirestoreService.updateTask(user.uid, taskToEdit.id, taskData);
        } else {
        const newTask = await FirestoreService.addTask(user.uid, taskData);
        // Schedule notification for new tasks
        if (taskData.dueDate) {
            scheduleTaskNotification({ id: newTask.id, ...taskData });
        }
        }
        setTaskToEdit(null);
    };

  const handleToggleTask = (task) => {
    if (!task.isCompleted) {
        FirestoreService.handleCompleteTask(user.uid, task.id, task.priority);
    } else {
        // Optional: Add logic to un-complete a task
        FirestoreService.updateTask(user.uid, task.id, { isCompleted: false });
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => FirestoreService.deleteTask(user.uid, taskId) },
    ]);
  };
  
  const openEditModal = (task) => {
    setTaskToEdit(task);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setTaskToEdit(null);
    setModalVisible(true);
  };

  const startFocusSession = (task) => {
      navigation.navigate('Focus', { task });
  };
  // Add this inside DashboardScreen, inside a useEffect
useEffect(() => {
  const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  };

  registerForPushNotificationsAsync();
}, []);
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Zenith List" />
      </Appbar.Header>

      {/* Gamification Bar */}
      <View style={styles.gamificationBar}>
        <Text>LVL: {userData?.level || 1}</Text>
        <Text>🔥 {userData?.streak || 0}</Text>
        <Text>PTS: {userData?.points || 0}</Text>
      </View>
      
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        style={styles.filters}
        buttons={[
          { value: 'All', label: 'All', icon: 'view-list' },
          { value: 'Today', label: 'Today', icon: 'calendar-today' },
          { value: 'Upcoming', label: 'Next 7D', icon: 'calendar-week' },
          { value: 'Completed', label: 'Done', icon: 'check-all' },
        ]}
      />

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={() => handleToggleTask(item)}
              onDelete={() => handleDeleteTask(item.id)}
              onEdit={() => openEditModal(item)}
              onFocus={() => startFocusSession(item)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks here. Great job! ✨</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gamificationBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: '#2c2c2c' },
  filters: { padding: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
});

export default DashboardScreen;