import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ChecklistItem } from '@/data/checklists';
import { supabase } from '@/lib/supabase';

const preferenceKey = (userId: string) => `plandee:task-reminders:${userId}`;
const channelId = 'task-reminders';
const marker = 'plandee-task-due';
let syncQueue: Promise<void> = Promise.resolve();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

const canNotify = async () => {
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

const reminderDate = (dueDate: string, now = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
  const due = new Date(`${dueDate}T09:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const dayBefore = new Date(due);
  dayBefore.setDate(dayBefore.getDate() - 1);
  if (dayBefore.getTime() > now.getTime()) return dayBefore;
  return due.getTime() > now.getTime() ? due : null;
};

const cancelOurScheduled = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((request) => request.content.data?.kind === marker)
    .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)));
};

const sync = async (userId: string | null, items: ChecklistItem[]) => {
  if (Platform.OS === 'web') return;
  await cancelOurScheduled();
  if (!userId || await AsyncStorage.getItem(preferenceKey(userId)) !== 'true' || !await canNotify()) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: 'เตือนงานใกล้ครบกำหนด',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const upcoming = items.filter((item) => !item.done)
    .map((item) => ({ item, date: reminderDate(item.dueDate) }))
    .filter((entry): entry is { item: ChecklistItem; date: Date } => entry.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 50);
  for (const { item, date } of upcoming) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'งานใกล้ครบกำหนด',
        body: `${item.title}${item.assigneeName ? ` · ผู้รับผิดชอบ: ${item.assigneeName}` : ''}`,
        data: { kind: marker, userId, taskId: item.id, url: `/event/checklist-edit?id=${encodeURIComponent(item.id)}` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
    });
  }
};

const enqueue = (userId: string | null, items: ChecklistItem[]) => {
  const operation = syncQueue.catch(() => undefined).then(() => sync(userId, items));
  syncQueue = operation.catch(() => undefined);
  return operation;
};

export const isTaskReminderEnabled = async () => {
  const { data } = await supabase.auth.getSession();
  return Platform.OS !== 'web' && !!data.session && await AsyncStorage.getItem(preferenceKey(data.session.user.id)) === 'true' && await canNotify();
};

export const enableTaskReminders = async (items: ChecklistItem[]) => {
  if (Platform.OS === 'web') return false;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, { name: 'เตือนงานใกล้ครบกำหนด', importance: Notifications.AndroidImportance.DEFAULT });
  }
  if (!await canNotify()) await Notifications.requestPermissionsAsync();
  if (!await canNotify()) return false;
  await AsyncStorage.setItem(preferenceKey(data.session.user.id), 'true');
  await enqueue(data.session.user.id, items);
  return true;
};

export const disableTaskReminders = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) await AsyncStorage.removeItem(preferenceKey(data.session.user.id));
  await enqueue(null, []);
};

export const refreshTaskReminders = async (items: ChecklistItem[]) => {
  const { data } = await supabase.auth.getSession();
  await enqueue(data.session?.user.id ?? null, items).catch(() => undefined);
};

export const clearScheduledTaskReminders = () => enqueue(null, []).catch(() => undefined);
