import * as Notifications from 'expo-notifications';
import { Alarm } from './types';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<string | null> {
  try {
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(alarm.hour, alarm.minute, 0, 0);

    if (trigger.getTime() <= now.getTime()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Ébresztő!',
        body: `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`,
        data: { alarmId: alarm.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });

    return notificationId;
  } catch (e) {
    console.error('Nem sikerült az ébresztő ütemezése', e);
    return null;
  }
}

export async function cancelAlarm(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('Nem sikerült az ébresztő törlése', e);
  }
}
