javascript
const CACHE_NAME = 'celestial-sync-v1';

// Assets required for offline functionality
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Install Event - Caches the shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching Celestial Sync Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); 
});

// Activate Event - Cleans up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting Old Cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); 
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If online, cache the latest version and return it
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If offline, serve from cache
                return caches.match(event.request);
            })
    );
});