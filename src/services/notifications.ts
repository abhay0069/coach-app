import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from './storage';
import { Task, NotificationSettings } from '@/types';
import { format, parse } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    // Still work in emulator but don't block the app.
    return true;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync('quiz-reminders', {
      name: 'Quiz Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return finalStatus === 'granted';
}

export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

function timeToDate(time: string, addDays = 0): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  d.setHours(h, m, 0, 0);
  return d;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminders(settings: NotificationSettings): Promise<void> {
  await cancelAllNotifications();
  if (!settings.enabled) return;

  const granted = await areNotificationsEnabled();
  if (!granted) return;

  // Morning reminder
  if (settings.morningReminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Good morning, learner ☀️',
        body: 'Your learning plan is ready. Tap to see today\'s goal.',
        data: { screen: 'today' },
        sound: true,
      },
      trigger: {
        hour: parse(settings.morningTime, 'HH:mm', new Date()).getHours(),
        minute: parse(settings.morningTime, 'HH:mm', new Date()).getMinutes(),
        repeats: true,
        channelId: 'study-reminders',
      } as any,
    });
  }

  // Study reminder
  if (settings.studyReminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to learn 🎯',
        body: 'Your next task is waiting. Tap to continue.',
        data: { screen: 'today' },
        sound: true,
      },
      trigger: {
        hour: parse(settings.studyReminderTime, 'HH:mm', new Date()).getHours(),
        minute: parse(settings.studyReminderTime, 'HH:mm', new Date()).getMinutes(),
        repeats: true,
        channelId: 'study-reminders',
      } as any,
    });
  }

  // Evening quiz
  if (settings.eveningQuiz) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Knowledge Check 🧠',
        body: 'Take 5 quick questions to lock in what you learned today.',
        data: { screen: 'quiz' },
        sound: true,
      },
      trigger: {
        hour: parse(settings.eveningQuizTime, 'HH:mm', new Date()).getHours(),
        minute: parse(settings.eveningQuizTime, 'HH:mm', new Date()).getMinutes(),
        repeats: true,
        channelId: 'quiz-reminders',
      } as any,
    });
  }

  // Weekly progress (Monday 9am)
  if (settings.weeklyProgress) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Progress Report 📊',
        body: 'See how consistent you were this week and plan the next milestone.',
        data: { screen: 'progress' },
      },
      trigger: { weekday: 2, hour: 9, minute: 0, repeats: true } as any,
    });
  }
}

export async function scheduleTaskReminder(task: Task, minutesFromNow = 15): Promise<void> {
  const granted = await areNotificationsEnabled();
  if (!granted) return;
  const trigger = new Date(Date.now() + minutesFromNow * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: `Don't forget: ${task.title}`,
      data: { screen: 'task', taskId: task.id },
    },
    trigger,
  });
}

// Respond to a tapped notification (call from root layout).
export function addNotificationResponseListener(
  handler: (data: any) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    handler(data);
  });
  return () => sub.remove();
}

// Helper used by the app: check quiet hours
export function isInQuietHours(settings: NotificationSettings, now = new Date()): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;
  const start = parse(settings.quietHoursStart, 'HH:mm', now);
  const end = parse(settings.quietHoursEnd, 'HH:mm', now);
  if (start <= end) return now >= start && now <= end;
  // overnight
  return now >= start || now <= end;
}
