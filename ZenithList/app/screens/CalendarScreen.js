// app/screens/CalendarScreen.js
import React, { useContext, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, startOfDay } from 'date-fns';
import { TasksContext } from '../context/TasksContext';
import TaskItem from '../components/TaskItem'; // We can reuse our TaskItem!
import { AuthContext } from '../context/AuthContext';
import * as FirestoreService from '../firebase/firestore';

const CalendarScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const { tasks, loading } = useContext(TasksContext);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Memoize the marked dates to prevent re-computation on every render
    const markedDates = useMemo(() => {
        const markings = {};

        tasks.forEach(task => {
            if (task.dueDate) {
                const dateString = format(task.dueDate.toDate(), 'yyyy-MM-dd');
                if (!markings[dateString]) {
                    markings[dateString] = { dots: [], marked: true };
                }
                // Add a dot for each task, maybe color-coded by priority
                const priorityColors = { High: theme.colors.error, Medium: 'orange', Low: theme.colors.primary };
                markings[dateString].dots.push({ color: priorityColors[task.priority] || theme.colors.placeholder });
            }
        });

        // Add a selected indicator to the currently selected date
        if (markings[selectedDate]) {
            markings[selectedDate].selected = true;
            markings[selectedDate].selectedColor = theme.colors.primary;
        } else {
            markings[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
        }

        return markings;
    }, [tasks, selectedDate, theme.colors]);

    // Memoize the tasks for the selected date
    const tasksForSelectedDate = useMemo(() => {
        const selectedDayStart = startOfDay(new Date(selectedDate));
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDayStart = startOfDay(task.dueDate.toDate());
            return taskDayStart.getTime() === selectedDayStart.getTime();
        }).sort((a, b) => a.isCompleted - b.isCompleted); // Show incomplete tasks first
    }, [tasks, selectedDate]);
    
    // Handlers for TaskItem actions (optional, but good for UX)
    const handleToggleTask = (task) => {
        if (!task.isCompleted) {
            FirestoreService.handleCompleteTask(user.uid, task.id, task.priority);
        } else {
            FirestoreService.updateTask(user.uid, task.id, { isCompleted: false });
        }
    };

    const openEditModal = (task) => {
        // To implement this, you would need to lift the AddTaskModal state
        // to a higher-level context or use a different navigation strategy.
        // For now, we can navigate to the dashboard as a placeholder.
        console.log("Editing task:", task.title);
        navigation.navigate('Dashboard');
    };

    const startFocusSession = (task) => {
        navigation.navigate('Focus', { task });
    };


    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 2 }}>
                <Appbar.Content title="Calendar" titleStyle={{ fontWeight: 'bold' }} />
            </Appbar.Header>

            <Calendar
                current={selectedDate}
                onDayPress={day => setSelectedDate(day.dateString)}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{
                    backgroundColor: theme.colors.background,
                    calendarBackground: theme.colors.surface,
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.text,
                    textDisabledColor: theme.colors.disabled,
                    dotColor: theme.colors.primary,
                    selectedDotColor: '#ffffff',
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.primary,
                    indicatorColor: theme.colors.primary,
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                }}
            />

            <Text variant="titleMedium" style={styles.listHeader}>
                Tasks for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </Text>

            <FlatList
                data={tasksForSelectedDate}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        onToggle={() => handleToggleTask(item)}
                        onDelete={() => {/* Deleting from here might be complex, handle as needed */}}
                        onEdit={() => openEditModal(item)}
                        onFocus={() => startFocusSession(item)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tasks for this day.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#A9A9A9',
    },
});

export default CalendarScreen;