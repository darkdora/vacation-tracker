const CACHE_NAME = 'vacation-tracker-v1';
const urlsToCache = [
  '/vacation-tracker/',
  '/vacation-tracker/index.html',
  '/vacation-tracker/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
