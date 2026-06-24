'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startAlarmChecker, stopAlarmChecker } from '../lib/alarmManager';

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    startAlarmChecker((id) => {
      // Show system notification if permission granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Ébresztő!', {
          icon: '/icon.svg',
          tag: `alarm-${id}`,
          data: { alarmId: id },
          requireInteraction: true,
        });
      }
      router.push(`/ring/${id}`);
    });

    return () => stopAlarmChecker();
  }, [router]);

  return <>{children}</>;
}
