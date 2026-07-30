const CACHE_NAME = 'refugio-v7';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia "red primero": siempre intenta traer la version mas nueva.
// Solo usa la copia guardada si no hay internet (modo offline real).
// Esto evita que la app se quede pegada en una version vieja.
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('api.groq.com')) return;
  if (event.request.url.includes('cdnjs.cloudflare.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
