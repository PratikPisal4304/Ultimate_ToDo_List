// app/notifications.js
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleTaskNotification = async (task) => {
  const trigger = task.dueDate; // This should be a Date object
  
  if (trigger < new Date()) {
      console.log("Cannot schedule notification for a past date.");
      return;
  }
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Task Due Soon!",
        body: task.title,
        data: { taskId: task.id },
      },
      trigger,
    });
    console.log(`Notification scheduled for task: ${task.title}`);
  } catch (e) {
      console.error("Error scheduling notification:", e);
  }
};