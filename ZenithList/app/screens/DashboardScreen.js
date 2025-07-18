// app/screens/DashboardScreen.js
import React, { useState, useContext, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, SegmentedButtons, ActivityIndicator, Appbar, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';
import * as FirestoreService from '../firebase/firestore';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import GamificationHeader from '../components/GamificationHeader'; // Import the new component
import useFilteredTasks from '../hooks/useFilteredTasks'; // Import the custom hook

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { tasks, userData, loading } = useContext(TasksContext);
  const theme = useTheme();

  const [filter, setFilter] = useState('All'); // All, Today, Upcoming, Completed
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Use the custom hook for filtering tasks
  const filteredTasks = useFilteredTasks(tasks, filter);

  const handleSaveTask = useCallback(async (taskData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (taskToEdit) {
      await FirestoreService.updateTask(user.uid, taskToEdit.id, taskData);
    } else {
      await FirestoreService.addTask(user.uid, taskData);
    }
    setTaskToEdit(null);
  }, [user, taskToEdit]);

  const handleToggleTask = useCallback((task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!task.isCompleted) {
        FirestoreService.handleCompleteTask(user.uid, task.id, task.priority);
    } else {
        FirestoreService.updateTask(user.uid, task.id, { isCompleted: false });
    }
  }, [user]);

  const handleDeleteTask = useCallback((taskId) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          FirestoreService.deleteTask(user.uid, taskId);
      }},
    ]);
  }, [user]);

  const openEditModal = useCallback((task) => {
    setTaskToEdit(task);
    setModalVisible(true);
  }, []);

  const openAddModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTaskToEdit(null);
    setModalVisible(true);
  }, []);

  const startFocusSession = useCallback((task) => {
      navigation.navigate('Focus', { task });
  }, [navigation]);

  const renderTaskItem = useCallback(({ item }) => (
    <TaskItem
        task={item}
        onToggle={() => handleToggleTask(item)}
        onDelete={() => handleDeleteTask(item.id)}
        onEdit={() => openEditModal(item)}
        onFocus={() => startFocusSession(item)}
    />
  ), [handleToggleTask, handleDeleteTask, openEditModal, startFocusSession]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.background]}
        style={styles.headerGradient}
      >
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.Content
            title={`Hello, ${user?.email?.split('@')[0] || 'Guest'}`}
            subtitle={`Today is ${format(new Date(), 'MMMM d')}`}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
          />
        </Appbar.Header>
        <GamificationHeader userData={userData} />
      </LinearGradient>

      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        style={styles.filters}
        buttons={[
          { value: 'All', label: 'All', icon: 'view-list' },
          { value: 'Today', label: 'Today', icon: 'calendar-today' },
          { value: 'Upcoming', label: '7 Days', icon: 'calendar-week' },
          { value: 'Completed', label: 'Done', icon: 'check-all' },
        ]}
      />

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>All clear! ✅</Text>
                <Text style={styles.emptySubText}>
                    {filter === 'All' ? "Add a new task to get started." : `No ${filter.toLowerCase()} tasks.`}
                </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
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
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={openAddModal}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  appbarHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  filters: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, elevation: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyText: { fontSize: 22, fontWeight: 'bold' },
  emptySubText: { fontSize: 16, color: '#A9A9A9', marginTop: 8, textAlign: 'center' },
});

export default DashboardScreen;