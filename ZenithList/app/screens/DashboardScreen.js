// app/screens/DashboardScreen.js
import React, { useState, useContext, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, SegmentedButtons, ActivityIndicator, Appbar, useTheme, ProgressBar, Searchbar } from 'react-native-paper';
import { isToday, isWithinInterval, addDays, format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';
import * as FirestoreService from '../firebase/firestore';

import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';

// Gamification Header Component
const GamificationHeader = ({ userData }) => {
    const theme = useTheme();
    const level = userData?.level || 1;
    const points = userData?.points || 0;
    const pointsForNextLevel = level * 100;
    const pointsInCurrentLevel = points - ((level - 1) * 100);
    const progress = pointsInCurrentLevel / 100;

    return (
        <View style={[styles.gamificationBar, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>LVL {level}</Text>
                <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
                <Text style={styles.statLabel}>{pointsInCurrentLevel} / 100 PTS</Text>
            </View>
            <View style={styles.statBlock}>
                <Text style={styles.statValue}>🔥 {userData?.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
            </View>
        </View>
    );
};


const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { tasks, userData, loading } = useContext(TasksContext);
  const theme = useTheme();

  const [filter, setFilter] = useState('All'); // All, Today, Upcoming, Completed
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    // Start with all tasks and sort them
    let sortedTasks = tasks.sort((a,b) => (a.createdAt?.toDate() || 0) < (b.createdAt?.toDate() || 0) ? 1 : -1);

    // Apply the primary filter (All, Today, etc.)
    let primarilyFilteredTasks;
    switch (filter) {
      case 'Today':
        primarilyFilteredTasks = sortedTasks.filter(t => !t.isCompleted && t.dueDate && isToday(t.dueDate.toDate()));
        break;
      case 'Upcoming':
        primarilyFilteredTasks = sortedTasks.filter(t => !t.isCompleted && t.dueDate && isWithinInterval(t.dueDate.toDate(), { start: now, end: addDays(now, 7) }));
        break;
      case 'Completed':
         primarilyFilteredTasks = sortedTasks.filter(t => t.isCompleted);
        break;
      case 'All':
      default:
        primarilyFilteredTasks = sortedTasks.filter(t => !t.isCompleted);
        break;
    }

    // Apply the search query filter on top of the primary filter
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        return primarilyFilteredTasks.filter(task => 
            task.title.toLowerCase().includes(lowercasedQuery) ||
            (task.description && task.description.toLowerCase().includes(lowercasedQuery))
        );
    }

    return primarilyFilteredTasks;
  }, [tasks, filter, searchQuery]); // Add searchQuery to dependency array

  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      await FirestoreService.updateTask(user.uid, taskToEdit.id, taskData);
    } else {
      await FirestoreService.addTask(user.uid, taskData);
    }
    setTaskToEdit(null);
  };

  const handleToggleTask = (task) => {
    if (!task.isCompleted) {
        FirestoreService.handleCompleteTask(user.uid, task.id, task.priority);
    } else {
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
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor: theme.colors.background}}>
        <Appbar.Content title={`Hello, ${user?.email?.split('@')[0] || 'Guest'}`} subtitle={`Today is ${format(new Date(), 'MMMM d')}`} />
      </Appbar.Header>

      <GamificationHeader userData={userData} />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
            placeholder="Search tasks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="magnify"
        />
      </View>

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
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={() => handleToggleTask(item)}
              onDelete={() => handleDeleteTask(item.id)}
              onEdit={() => openEditModal(item)}
              onFocus={() => startFocusSession(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{searchQuery ? "No matches found" : "All clear!"}</Text>
                <Text style={styles.emptySubText}>
                    {searchQuery ? `No tasks match "${searchQuery}"` : (filter === 'All' ? "Add a new task to get started." : `No ${filter.toLowerCase()} tasks.`)}
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
  gamificationBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, marginHorizontal: 16, borderRadius: 12, marginTop: 8 },
  statBlock: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#A9A9A9', marginTop: 4 },
  progressBar: { width: '80%', marginTop: 8, height: 6, borderRadius: 3 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchbar: {
    borderRadius: 12,
  },
  filters: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyText: { fontSize: 22, fontWeight: 'bold' },
  emptySubText: { fontSize: 16, color: '#A9A9A9', marginTop: 8, textAlign: 'center' },
});

export default DashboardScreen;