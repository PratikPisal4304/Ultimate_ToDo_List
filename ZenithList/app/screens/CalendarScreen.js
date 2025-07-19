// app/screens/CalendarScreen.js
import React, { useContext, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, SectionList } from 'react-native';
import { Appbar, Text, useTheme, Button } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, startOfDay, addDays, isToday, isTomorrow } from 'date-fns';
import { TasksContext } from '../context/TasksContext';
import TaskItem from '../components/TaskItem';
import { AuthContext } from '../context/AuthContext';
import * as FirestoreService from '../firebase/firestore';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const CalendarScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const { tasks } = useContext(TasksContext);
    const { isDarkMode } = useContext(ThemeContext); // Get theme state
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Memoize marked dates for performance
    const markedDates = useMemo(() => {
        const markings = {};
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateString = format(task.dueDate.toDate(), 'yyyy-MM-dd');
                if (!markings[dateString]) {
                    markings[dateString] = { dots: [], marked: true };
                }
                const priorityColors = { High: theme.colors.error, Medium: 'orange', Low: theme.colors.primary };
                markings[dateString].dots.push({ key: task.id, color: priorityColors[task.priority] || theme.colors.placeholder });
            }
        });

        // Highlight the selected date
        markings[selectedDate] = {
            ...markings[selectedDate],
            selected: true,
            selectedColor: theme.colors.calendar.selectedDayBackground,
            selectedTextColor: theme.colors.calendar.selectedDayText,
        };

        return markings;
    }, [tasks, selectedDate, theme.colors]);

    // Group upcoming tasks by date for the agenda view
    const agendaTasks = useMemo(() => {
        const today = startOfDay(new Date());
        const nextSevenDays = addDays(today, 7);

        const upcomingTasks = tasks.filter(task => {
            if (!task.dueDate || task.isCompleted) return false;
            const taskDate = task.dueDate.toDate();
            // Show tasks for today and the next 7 days
            return taskDate >= today && taskDate <= nextSevenDays;
        });

        const groupedTasks = upcomingTasks.reduce((acc, task) => {
            const dateString = format(task.dueDate.toDate(), 'yyyy-MM-dd');
            if (!acc[dateString]) acc[dateString] = [];
            acc[dateString].push(task);
            return acc;
        }, {});

        return Object.keys(groupedTasks).map(date => ({
            title: date,
            data: groupedTasks[date]
        })).sort((a, b) => new Date(a.title) - new Date(b.title));
    }, [tasks]);


    // Handlers for TaskItem actions
    const handleToggleTask = useCallback((task) => {
        if (!task.isCompleted) {
            FirestoreService.handleCompleteTask(user.uid, task);
        } else {
            FirestoreService.updateTask(user.uid, task.id, { isCompleted: false });
        }
    }, [user]);

    const openEditModal = useCallback((task) => {
        // This functionality needs to be handled differently as the modal is on Dashboard.
        // For now, we assume navigation is set up to handle this.
        // A better long-term solution might be a global modal context.
        navigation.navigate('Dashboard', { screen: 'Dashboard', params: { taskToEdit: task, openModal: true } });
    }, [navigation]);

    const startFocusSession = useCallback((task) => {
        navigation.navigate('Focus', { task });
    }, [navigation]);

    const getSectionTitle = (title) => {
        const date = new Date(title + 'T00:00:00'); // Ensure correct date parsing
        if (isToday(date)) return `Today, ${format(date, 'MMMM d')}`;
        if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMMM d')}`;
        return format(date, 'EEEE, MMMM d');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 2 }}>
                <Appbar.Content title="Calendar & Agenda" titleStyle={{ fontWeight: 'bold' }} />
                <Button textColor={theme.colors.primary} onPress={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>Today</Button>
            </Appbar.Header>

            <Calendar
                // FIX: Add a key that changes with the theme to force a re-render
                key={isDarkMode ? 'dark-calendar' : 'light-calendar'}
                current={selectedDate}
                onDayPress={day => setSelectedDate(day.dateString)}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{
                    backgroundColor: theme.colors.calendar.background,
                    calendarBackground: theme.colors.calendar.background,
                    textSectionTitleColor: theme.colors.placeholder,
                    selectedDayBackgroundColor: theme.colors.calendar.selectedDayBackground,
                    selectedDayTextColor: theme.colors.calendar.selectedDayText,
                    todayTextColor: theme.colors.calendar.todayText,
                    dayTextColor: theme.colors.calendar.dayText,
                    textDisabledColor: theme.colors.calendar.textDisabled,
                    arrowColor: theme.colors.calendar.arrowColor,
                    monthTextColor: theme.colors.calendar.monthText,
                    textMonthFontWeight: 'bold',
                    'stylesheet.calendar.header': {
                        week: {
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-around'
                        },
                    }
                }}
            />

            <SectionList
                sections={agendaTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        onToggle={() => handleToggleTask(item)}
                        onDelete={() => FirestoreService.deleteTask(user.uid, item.id)}
                        onEdit={() => openEditModal(item)}
                        onFocus={() => startFocusSession(item)}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text variant="titleMedium" style={[styles.listHeader, { color: theme.colors.primary, backgroundColor: theme.colors.background }]}>
                        {getSectionTitle(title)}
                    </Text>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No upcoming tasks for the next 7 days.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        fontWeight: 'bold'
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