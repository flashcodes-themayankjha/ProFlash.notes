import * as Notifications from 'expo-notifications';
import { Task } from './supabaseTasks';

export async function scheduleNotification(task: Task) {
  if (!task.reminder) return;

  const reminderDate = new Date(task.reminder);
  if (reminderDate < new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task Reminder",
      body: task.title,
      data: { taskId: task.id },
    },
    trigger: reminderDate,
  });
}

export async function cancelNotification(taskId: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
