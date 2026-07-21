// Versienummer ophogen bij wijzigingen aan de assets, zodat oude caches opgeruimd worden
const CACHE_NAME = 'go-fitness-cache-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './fonts/fonts.css',
    './fonts/inter-latin.woff2',
    './fonts/material-icons-round.woff2',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
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
