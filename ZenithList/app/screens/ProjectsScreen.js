// app/screens/ProjectsScreen.js
import React, { useContext, useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, List, useTheme, Appbar, ActivityIndicator, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';
import * as FirestoreService from '../firebase/firestore';
import * as Haptics from 'expo-haptics';
import AddProjectModal from '../components/AddProjectModal';

const ProjectItem = React.memo(({ project, taskCount, onEdit, onDelete }) => {
    const theme = useTheme();
    return (
        <List.Item
            title={project.name}
            titleStyle={{fontWeight: 'bold', fontSize: 18}}
            description={`${taskCount} tasks`}
            descriptionStyle={{fontSize: 14}}
            left={() => (
                <View style={[styles.projectIconContainer, {backgroundColor: project.color + '33'}]}>
                    <List.Icon icon={project.icon} color={project.color} />
                </View>
            )}
            right={() => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconButton icon="pencil-outline" size={20} onPress={onEdit} />
                    <IconButton icon="trash-can-outline" iconColor={theme.colors.error} size={20} onPress={onDelete} />
                </View>
            )}
            style={[styles.projectItem, {backgroundColor: theme.colors.surface}]}
        />
    );
});


const ProjectsScreen = () => {
    const { user } = useContext(AuthContext);
    const { projects, tasks, loading } = useContext(TasksContext);
    const theme = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);

    const taskCounts = useMemo(() => {
        const counts = {};
        tasks.forEach(task => {
            if (task.projectId) {
                counts[task.projectId] = (counts[task.projectId] || 0) + 1;
            }
        });
        // Count tasks with no project for 'All Tasks'
        counts['all'] = tasks.length;
        return counts;
    }, [tasks]);

    const handleSaveProject = useCallback(async (projectData) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (projectToEdit) {
            await FirestoreService.updateProject(user.uid, projectToEdit.id, projectData);
        } else {
            await FirestoreService.addProject(user.uid, projectData);
        }
        setProjectToEdit(null);
    }, [user, projectToEdit]);

    const handleDeleteProject = useCallback((projectId, projectName) => {
        Alert.alert(
            `Delete "${projectName}"?`,
            "This will also delete all tasks within this project. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    FirestoreService.deleteProject(user.uid, projectId);
                }},
            ]
        );
    }, [user]);

    const openEditModal = useCallback((project) => {
        setProjectToEdit(project);
        setModalVisible(true);
    }, []);

    const openAddModal = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setProjectToEdit(null);
        setModalVisible(true);
    }, []);

    const userProjects = useMemo(() => projects.filter(p => p.id !== 'all'), [projects]);

    const renderProjectItem = useCallback(({ item }) => (
        <ProjectItem
            project={item}
            taskCount={taskCounts[item.id] || 0}
            onEdit={() => openEditModal(item)}
            onDelete={() => handleDeleteProject(item.id, item.name)}
        />
    ), [taskCounts, openEditModal, handleDeleteProject]);

    return (
        <View style={styles.container}>
            <Appbar.Header style={{backgroundColor: theme.colors.background, elevation: 0}}>
                <Appbar.Content title="Projects" titleStyle={{fontWeight: 'bold', fontSize: 28}} />
            </Appbar.Header>

            {loading ? (
                <ActivityIndicator style={{marginTop: 50}} />
            ) : (
                <FlatList
                    data={userProjects}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProjectItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>Create a project to get started.</Text>}
                    contentContainerStyle={{padding: 16}}
                />
            )}

            <AddProjectModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
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

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
    projectItem: {
        marginBottom: 12,
        borderRadius: 16,
        paddingVertical: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    projectIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#A9A9A9'
    }
});

export default ProjectsScreen;