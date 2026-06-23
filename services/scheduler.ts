import * as Notifications from 'expo-notifications';
import { Alarm } from '../types/alarm';

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
  if (!alarm.enabled) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || '⏰ Ébresztő',
        body: `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`,
        sound: true,
        data: { alarmId: alarm.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: alarm.hour,
        minute: alarm.minute,
      },
    });
    return id;
  } catch (e) {
    console.error('Notification scheduling failed:', e);
    return null;
  }
}

export async function cancelAlarmNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('Notification cancel failed:', e);
  }
}

export async function scheduleSnoozeNotification(alarm: Alarm): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || '⏰ Szundi lejárt',
        body: 'Ideje felkelni!',
        sound: true,
        data: { alarmId: alarm.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10 * 60,
      },
    });
  } catch (e) {
    console.error('Snooze scheduling failed:', e);
  }
}
