// sw.js - Service Worker pour le mode offline

const CACHE_NAME = 'vacation-tracker-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/main.js',
    './js/map.js',
    './js/trips.js',
    './js/ui.js',
    './js/firebase-config.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://api.iconify.design/fluent-emoji-flat:airplane-departure.svg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retourner la réponse du cache si elle existe
                if (response) {
                    return response;
                }
                
                // Sinon, faire la requête réseau
                return fetch(event.request).then(response => {
                    // Ne pas mettre en cache les requêtes non-GET
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Cloner la réponse pour la mettre en cache
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
            .catch(() => {
                // En cas d'erreur réseau, retourner une page offline
                // Tu peux créer une page offline.html si tu veux
                console.log('Erreur réseau, mode offline');
            })
    );
});
