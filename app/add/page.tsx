'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { putAlarm } from '../../lib/db';
import type { Alarm } from '../../lib/types';

export default function AddPage() {
  const router = useRouter();
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    const [h, m] = time.split(':').map(Number);
    const alarm: Alarm = {
      id: Date.now().toString(),
      hour: h,
      minute: m,
      label: label.trim(),
      photo,
      enabled: true,
    };
    await putAlarm(alarm);
    router.back();
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-10">
      <div className="flex items-center gap-3 py-6">
        <button onClick={() => router.back()} className="text-accent text-lg">
          ← Vissza
        </button>
        <h1 className="text-xl font-semibold">Ébresztő beállítása</h1>
      </div>

      <section className="flex flex-col gap-6">
        {/* Time picker */}
        <div className="bg-card rounded-2xl p-5 flex flex-col gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Időpont
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-transparent text-white text-5xl font-thin tracking-widest w-full outline-none"
          />
        </div>

        {/* Label */}
        <div className="bg-card rounded-2xl p-5 flex flex-col gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Megnevezés (opcionális)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="pl. Reggeli ébresztő"
            className="bg-transparent text-white text-base outline-none placeholder-gray-600"
          />
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold px-1">
            Fotó ébresztéskor
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-card rounded-2xl overflow-hidden w-full active:opacity-80 transition-opacity"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Kiválasztott fotó" className="w-full h-56 object-cover" />
            ) : (
              <div className="h-44 flex flex-col items-center justify-center gap-3 text-gray-600">
                <span className="text-5xl">🖼️</span>
                <span className="text-sm">Koppints a fotó kiválasztásához</span>
              </div>
            )}
          </button>
          {photo && (
            <button
              onClick={() => setPhoto(null)}
              className="text-red-500 text-sm text-center"
            >
              Fotó eltávolítása
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* Save */}
        <button
          onClick={save}
          className="bg-accent text-white rounded-2xl py-5 text-lg font-semibold shadow-lg shadow-accent/40 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          ⏰ Ébresztő mentése
        </button>
      </section>
    </main>
  );
}
