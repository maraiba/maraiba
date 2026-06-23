import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types/alarm';

const ALARMS_KEY = '@maraiba_alarms';

export async function loadAlarms(): Promise<Alarm[]> {
  try {
    const data = await AsyncStorage.getItem(ALARMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function addAlarm(alarm: Alarm): Promise<Alarm[]> {
  const alarms = await loadAlarms();
  const updated = [...alarms, alarm];
  await saveAlarms(updated);
  return updated;
}

export async function updateAlarm(alarm: Alarm): Promise<Alarm[]> {
  const alarms = await loadAlarms();
  const updated = alarms.map((a) => (a.id === alarm.id ? alarm : a));
  await saveAlarms(updated);
  return updated;
}

export async function deleteAlarm(id: string): Promise<Alarm[]> {
  const alarms = await loadAlarms();
  const updated = alarms.filter((a) => a.id !== id);
  await saveAlarms(updated);
  return updated;
}
