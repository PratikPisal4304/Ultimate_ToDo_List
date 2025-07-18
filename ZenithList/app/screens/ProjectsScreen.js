// app/screens/ProjectsScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const ProjectsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Projects (Coming Soon)</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
export default ProjectsScreen;