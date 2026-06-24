import { openDB } from 'idb';
import type { Alarm } from './types';

const DB = 'ebreszto';

async function db() {
  return openDB(DB, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains('alarms')) {
        d.createObjectStore('alarms', { keyPath: 'id' });
      }
    },
  });
}

export async function getAllAlarms(): Promise<Alarm[]> {
  return (await db()).getAll('alarms');
}

export async function getAlarm(id: string): Promise<Alarm | undefined> {
  return (await db()).get('alarms', id);
}

export async function putAlarm(alarm: Alarm): Promise<void> {
  await (await db()).put('alarms', alarm);
}

export async function removeAlarm(id: string): Promise<void> {
  await (await db()).delete('alarms', id);
}
