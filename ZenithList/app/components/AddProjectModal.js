// app/components/AddProjectModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ICON_CHOICES = ['briefcase', 'home', 'cart', 'book-open-variant', 'dumbbell', 'heart', 'star', 'flag'];
const COLOR_CHOICES = ['#6A5ACD', '#FF6347', '#32CD32', '#FFD700', '#00BFFF', '#FF69B4', '#9370DB'];

const AddProjectModal = ({ visible, onClose, onSave, projectToEdit }) => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('briefcase');
    const [color, setColor] = useState('#6A5ACD');

    useEffect(() => {
        if (projectToEdit) {
            setName(projectToEdit.name);
            setIcon(projectToEdit.icon);
            setColor(projectToEdit.color);
        } else {
            setName('');
            setIcon('briefcase');
            setColor('#6A5ACD');
        }
    }, [projectToEdit, visible]);

    const handleSave = () => {
        if (!name) {
            alert('Project name is required!');
            return;
        }
        onSave({ name, icon, color });
        onClose();
    };

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
                    <ScrollView contentContainerStyle={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                        <Text variant="headlineMedium" style={styles.modalTitle}>
                            {projectToEdit ? 'Edit Project' : 'New Project'}
                        </Text>
                        
                        <TextInput label="Project Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />

                        <Text style={styles.label}>Icon</Text>
                        <View style={styles.choiceContainer}>
                            {ICON_CHOICES.map(i => (
                                <TouchableOpacity key={i} onPress={() => setIcon(i)} style={[styles.iconChoice, {borderColor: icon === i ? color : theme.colors.placeholder}]}>
                                    <MaterialCommunityIcons name={i} size={30} color={icon === i ? color : theme.colors.text} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Color</Text>
                        <View style={styles.choiceContainer}>
                            {COLOR_CHOICES.map(c => (
                                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorChoice, {backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent'}]} />
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={[styles.saveButton, {backgroundColor: color}]}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                        >
                            {projectToEdit ? 'Update Project' : 'Create Project'}
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
    label: { alignSelf: 'flex-start', marginLeft: 5, marginBottom: 12, fontSize: 16, color: '#A9A9A9' },
    choiceContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25
    },
    iconChoice: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 10
    },
    colorChoice: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
    },
    saveButton: { borderRadius: 30, marginTop: 10 },
    buttonContent: { paddingVertical: 8 },
    buttonLabel: { fontSize: 16, fontWeight: 'bold' },
});

export default AddProjectModal;
