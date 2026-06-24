'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllAlarms, putAlarm, removeAlarm } from '../lib/db';
import type { Alarm } from '../lib/types';

export default function HomePage() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const load = useCallback(async () => {
    const list = await getAllAlarms();
    list.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    setAlarms(list);
  }, []);

  useEffect(() => {
    load();
    // Request notification permission on first load
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [load]);

  async function toggleAlarm(alarm: Alarm) {
    const updated = { ...alarm, enabled: !alarm.enabled };
    await putAlarm(updated);
    setAlarms((prev) => prev.map((a) => (a.id === alarm.id ? updated : a)));
  }

  async function deleteAlarm(alarm: Alarm) {
    if (!confirm(`Törlöd a(z) ${pad(alarm.hour)}:${pad(alarm.minute)} ébresztőt?`)) return;
    await removeAlarm(alarm.id);
    setAlarms((prev) => prev.filter((a) => a.id !== alarm.id));
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-28">
      <div className="flex items-center justify-between py-6">
        <h1 className="text-2xl font-semibold tracking-wide">Ébresztők</h1>
      </div>

      {alarms.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center">
          <span className="text-6xl">⏰</span>
          <p className="text-gray-500 text-lg font-medium">Nincs ébresztő</p>
          <p className="text-gray-600 text-sm px-8">Nyomd meg a + gombot az első hozzáadásához</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alarms.map((alarm) => (
            <li
              key={alarm.id}
              className={`bg-card rounded-2xl p-5 flex items-center justify-between transition-opacity ${!alarm.enabled ? 'opacity-40' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-5xl font-thin tracking-widest ${!alarm.enabled ? 'text-gray-500' : 'text-white'}`}>
                  {pad(alarm.hour)}:{pad(alarm.minute)}
                </span>
                {alarm.label && (
                  <span className="text-sm text-gray-400">{alarm.label}</span>
                )}
                {alarm.photo && (
                  <span className="text-xs text-accent">📷 Fotó csatolva</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAlarm(alarm)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${alarm.enabled ? 'bg-accent' : 'bg-gray-700'}`}
                  aria-label="Be/ki"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alarm.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm)}
                  className="text-red-500 text-xl px-1"
                  aria-label="Törlés"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push('/add')}
        className="fixed bottom-8 right-6 w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl shadow-lg shadow-accent/40 active:scale-95 transition-transform"
        aria-label="Ébresztő hozzáadása"
      >
        +
      </button>
    </main>
  );
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}
