const CACHE_NAME = 'go-fitness-cache';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    // We only have one cache now, but clean up the old v1/v2 caches
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        // Network-first strategie: haal altijd eerst de nieuwste versie op
        fetch(e.request).then(response => {
            // Als dat lukt, update de cache met deze nieuwste versie
            if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // Als we offline zijn (fetch faalt), val dan pas terug op de cache
            return caches.match(e.request);
        })
    );
});
