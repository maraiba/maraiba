const CACHE = 'ebreszto-v1';
const SHELL = ['/', '/add', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// When user taps the alarm notification → open the ring screen
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const id = e.notification.data?.alarmId;
  if (id) {
    e.waitUntil(clients.openWindow(`/ring/${id}`));
  }
});
