// app/screens/DashboardScreen.js
import React, { useState, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Alert, SectionList, ScrollView } from 'react-native';
import { Text, FAB, SegmentedButtons, ActivityIndicator, Appbar, useTheme, Searchbar, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';
import * as FirestoreService from '../firebase/firestore';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import GamificationHeader from '../components/GamificationHeader';
import useFilteredTasks from '../hooks/useFilteredTasks';

// --- Helper Function for Dynamic Greeting ---
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { tasks, userData, loading } = useContext(TasksContext);
  const theme = useTheme();

  // --- State Management ---
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('Creation Date');
  const [grouping, setGrouping] = useState('None');
  const [greeting, setGreeting] = useState('');

  const fabRef = useRef(null);

  useEffect(() => {
    setGreeting(getGreeting());
    if (fabRef.current) {
        fabRef.current.zoomIn(800);
    }
  }, []);

  // --- Data Processing Hooks ---

  const filteredTasks = useFilteredTasks(tasks, filter);
  
  const searchedTasks = useMemo(() => {
    if (!searchQuery) {
      return filteredTasks;
    }
    return filteredTasks.filter(task => {
      const query = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query);
      const tagMatch = task.tags?.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || descriptionMatch || tagMatch;
    });
  }, [searchQuery, filteredTasks]);

  const processedTasks = useMemo(() => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    let sorted = [...searchedTasks];
    if (sort === 'Due Date') {
      sorted.sort((a, b) => (a.dueDate?.toDate() || new Date(0)) - (b.dueDate?.toDate() || new Date(0)));
    } else if (sort === 'Priority') {
      sorted.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
    }
    
    if (grouping === 'Group by Priority') {
      const grouped = sorted.reduce((acc, task) => {
        const priority = task.priority || 'Medium';
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(task);
        return acc;
      }, {});
      
      return ['High', 'Medium', 'Low']
        .map(p => ({ title: p, data: grouped[p] || [] }))
        .filter(section => section.data.length > 0);
    }
    
    return sorted;
  }, [searchedTasks, sort, grouping]);

  // --- Action Handlers ---

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
        FirestoreService.handleCompleteTask(user.uid, task);
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

  // --- Render Functions ---

  const renderTaskItem = useCallback(({ item }) => (
    <TaskItem
        task={item}
        onToggle={() => handleToggleTask(item)}
        onDelete={() => handleDeleteTask(item.id)}
        onEdit={() => openEditModal(item)}
        onFocus={() => startFocusSession(item)}
    />
  ), [handleToggleTask, handleDeleteTask, openEditModal, startFocusSession]);

  const renderSectionHeader = ({ section: { title, data } }) => (
    <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.primary, backgroundColor: theme.colors.background }]}>
      {`${title} Priority (${data.length})`}
    </Text>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
        <Animatable.View animation="bounceIn" duration={1000}>
            <MaterialCommunityIcons name="check-circle-outline" size={80} color={theme.colors.placeholder} />
        </Animatable.View>
        <Text style={styles.emptyText}>All clear! ✅</Text>
        <Text style={styles.emptySubText}>
            {filter === 'All' ? "Add a new task to get started." : `No ${filter.toLowerCase()} tasks.`}
        </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* --- Header Section --- */}
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.headerGradient}
      >
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.Content
            title={`${greeting}, ${user?.email?.split('@')[0] || 'Guest'}`}
            subtitle={`Today is ${format(new Date(), 'MMMM d')}`}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
          />
        </Appbar.Header>
        <GamificationHeader userData={userData} />
      </LinearGradient>
      
      {/* --- Controls Section --- */}
      <Searchbar
        placeholder="Search tasks, tags, etc..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={1}
      />
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
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          <Text style={styles.controlLabel}>Sort by:</Text>
          {['Creation Date', 'Due Date', 'Priority'].map(s => (
            <Chip key={s} selected={sort === s} onPress={() => setSort(s)} style={styles.chip}>{s}</Chip>
          ))}
          <View style={styles.chipDivider} />
          <Text style={styles.controlLabel}>Group:</Text>
          <Chip
            selected={grouping === 'Group by Priority'}
            onPress={() => setGrouping(g => g === 'None' ? 'Group by Priority' : 'None')}
            style={styles.chip}
          >
            By Priority
          </Chip>
        </ScrollView>
      </View>


      {/* --- Task List Section --- */}
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : grouping === 'Group by Priority' ? (
        <SectionList
          sections={processedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
        />
      ) : (
        <FlatList
          data={processedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      {/* --- Modal and FAB --- */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      <Animatable.View ref={fabRef}>
        <FAB
          icon="plus"
          style={[styles.fab, {backgroundColor: theme.colors.primary}]}
          onPress={openAddModal}
          color="#fff"
        />
      </Animatable.View>
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
    fontSize: 22,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  filters: { paddingHorizontal: 16, paddingTop: 16 },
  controlsContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  controlLabel: {
    marginRight: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  chip: {
    marginRight: 8,
  },
  chipDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, elevation: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20, opacity: 0.6 },
  emptyText: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  emptySubText: { fontSize: 16, color: '#A9A9A9', marginTop: 8, textAlign: 'center' },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingBottom: 100, 
    paddingTop: 8
  },
});

export default DashboardScreen;