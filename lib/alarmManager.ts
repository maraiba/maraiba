import { getAllAlarms } from './db';

// Tracks which alarms already fired today to prevent duplicate fires
const firedLog = new Map<string, string>(); // alarmId -> 'YYYY-MM-DD HH:MM'

let interval: ReturnType<typeof setInterval> | null = null;
let onRing: ((id: string) => void) | null = null;

export function startAlarmChecker(callback: (id: string) => void) {
  onRing = callback;
  if (interval) clearInterval(interval);
  interval = setInterval(tick, 1000);
}

export function stopAlarmChecker() {
  if (interval) clearInterval(interval);
  interval = null;
}

async function tick() {
  const now = new Date();
  const dateMinute = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const alarms = await getAllAlarms();
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    if (alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) continue;

    const lastFired = firedLog.get(alarm.id);
    if (lastFired === dateMinute) continue;

    firedLog.set(alarm.id, dateMinute);
    onRing?.(alarm.id);
  }
}
