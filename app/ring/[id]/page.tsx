'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAlarm } from '../../../lib/db';
import { startSound, stopSound } from '../../../lib/sound';
import type { Alarm } from '../../../lib/types';

export default function RingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [alarm, setAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    getAlarm(id).then((a) => { if (a) setAlarm(a); });
    startSound();
    return () => stopSound();
  }, [id]);

  function dismiss() {
    stopSound();
    router.replace('/');
  }

  const timeStr = alarm
    ? `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`
    : '';

  return (
    <div className="fixed inset-0 flex flex-col" onClick={dismiss}>
      {/* Background photo */}
      {alarm?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={alarm.photo}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-bg flex items-center justify-center text-9xl">
          ⏰
        </div>
      )}

      {/* Overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-end pb-20 bg-black/50">
        <p className="text-white text-8xl font-thin tracking-widest drop-shadow-2xl">
          {timeStr}
        </p>
        {alarm?.label && (
          <p className="text-gray-200 text-2xl mt-3 drop-shadow-lg">{alarm.label}</p>
        )}

        <button
          onClick={dismiss}
          className="mt-16 flex items-center gap-3 border border-white/30 bg-white/15 rounded-full px-12 py-4 text-white text-xl font-medium backdrop-blur-sm active:scale-95 transition-transform"
        >
          ✕ Leállítás
        </button>
        <p className="text-white/50 text-sm mt-6">vagy bármelyik helyen koppintva</p>
      </div>
    </div>
  );
}
