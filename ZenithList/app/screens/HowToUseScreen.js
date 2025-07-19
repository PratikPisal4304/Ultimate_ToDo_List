// app/screens/HowToUseScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, useTheme, Card, List, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const HowToUseScreen = ({ navigation }) => {
  const theme = useTheme();

  // A custom component to ensure the description text wraps correctly
  const renderListItem = ({ title, description, icon }) => (
    <View>
      <List.Item
        title={title}
        titleStyle={styles.listItemTitle}
        description={() => <Text style={styles.listItemDescription}>{description}</Text>}
        left={() => <List.Icon icon={icon} style={styles.listIcon} />}
        style={styles.listItem}
      />
      <Divider />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 2 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Zenith List Guide" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <LinearGradient
            colors={[`${theme.colors.primary}99`, `${theme.colors.primary}4D`]}
            style={styles.header}
          >
            <Text variant="headlineSmall" style={styles.headerText}>Welcome to Zenith List</Text>
            <Text style={styles.headerSubtitle}>Your partner in productivity. Here’s how to get started.</Text>
          </LinearGradient>
        </Card>

        <List.AccordionGroup>
          <List.Accordion
            title="Mastering Your Dashboard"
            id="1"
            style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
            titleStyle={styles.accordionTitle}
            left={props => <List.Icon {...props} icon="view-dashboard-outline" />}
          >
            {renderListItem({
              title: "Add a Task",
              description: "Tap the floating '+' button at the bottom right corner of the dashboard to open the task creation modal.",
              icon: "plus-circle"
            })}
            {renderListItem({
              title: "Edit a Task",
              description: "Simply tap on any task in the list to open the editor. Alternatively, swipe the task to the left and tap the pencil icon.",
              icon: "pencil-circle"
            })}
            {renderListItem({
              title: "Delete a Task",
              description: "Swipe a task to the left to reveal the delete (trash can) button. A confirmation message will appear at the bottom, giving you a few seconds to undo the deletion.",
              icon: "delete-sweep"
            })}
            {renderListItem({
              title: "Start a Focus Session",
              description: "For tasks that require deep concentration, tap the 'brain' icon. This initiates a 25-minute Pomodoro timer, helping you focus without distractions.",
              icon: "brain"
            })}
            {renderListItem({
              title: "Filter, Sort, and Group",
              description: "Above your task list, you'll find powerful controls. Filter your view (e.g., 'Today', 'Completed'), sort tasks by due date or priority, and group them by priority for a clear, organized overview.",
              icon: "sort"
            })}
          </List.Accordion>

          <List.Accordion
            title="Creating the Perfect Task"
            id="2"
            style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
            titleStyle={styles.accordionTitle}
            left={props => <List.Icon {...props} icon="playlist-edit" />}
          >
            {renderListItem({
              title: "Generate Tasks with AI",
              description: 'In the "New Task" modal, describe a complex goal (e.g., "Plan a 3-day hiking trip" or "Prepare for a job interview"). The AI will break it down into actionable tasks and add them to your list.',
              icon: "auto-fix"
            })}
            {renderListItem({
              title: "Set Due Dates & Reminders",
              description: "Assign a due date for important deadlines. You can also add a specific reminder notification for any date and time before the task is due to make sure you never forget.",
              icon: "calendar-clock"
            })}
            {renderListItem({
              title: "Use Subtasks",
              description: "Break down large, multi-step tasks into manageable subtasks. You can check them off individually, and the main task card will display your progress.",
              icon: "format-list-checks"
            })}
            {renderListItem({
              title: "Organize with Tags",
              description: 'Add comma-separated tags (e.g., "work, urgent, project-x") to categorize your tasks. You can then use the search bar on the dashboard to quickly find all tasks with a specific tag.',
              icon: "tag-multiple-outline"
            })}
          </List.Accordion>

          <List.Accordion
            title="Gamification & Calendar"
            id="3"
            style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
            titleStyle={styles.accordionTitle}
            left={props => <List.Icon {...props} icon="star-circle-outline" />}
          >
            {renderListItem({
              title: "Level Up Your Productivity",
              description: "Completing tasks earns you points (PTS). Higher priority tasks are worth more. Gain 100 points to level up! Your current level and progress are always visible in the dashboard header.",
              icon: "trophy-award"
            })}
            {renderListItem({
              title: "Build Your Streak",
              description: "Maintain your momentum by completing at least one task every day. This builds your daily streak, motivating you to stay consistent. Your current streak is shown next to a fire icon.",
              icon: "fire"
            })}
            {renderListItem({
              title: "Calendar & Agenda View",
              description: "The 'Calendar' tab provides a visual overview of your schedule. Dots under each date represent tasks, colored by their priority. Below the calendar, an agenda shows a detailed list of your upcoming tasks for the next seven days.",
              icon: "calendar-month-outline"
            })}
          </List.Accordion>
        </List.AccordionGroup>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 24,
    overflow: 'hidden',
    borderRadius: 16,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  accordion: {
    borderRadius: 12,
    marginBottom: 12,
  },
  accordionTitle: {
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  listItemTitle: {
    marginBottom: 4, // Add space between title and description
  },
  listItemDescription: {
    lineHeight: 20, // Improve readability
    paddingRight: 16, // Ensure text doesn't overlap with other elements
  },
  listIcon: {
    marginRight: 0,
    marginLeft: -8,
  }
});

export default HowToUseScreen;