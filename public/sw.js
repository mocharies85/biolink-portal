// Service Worker Ringan Curiolot Link
const CACHE_NAME = 'curiolot-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Biarkan request data dinamis (D1, API, R2) lewat ke jaringan langsung
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});