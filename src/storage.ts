import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from './types';

const ALARMS_KEY = '@ebreszto/alarms';

export async function loadAlarms(): Promise<Alarm[]> {
  try {
    const json = await AsyncStorage.getItem(ALARMS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}
