// Versienummer ophogen bij wijzigingen aan de assets, zodat oude caches opgeruimd worden
const CACHE_NAME = 'go-fitness-cache-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './sync.js',
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
    // Alleen same-origin GET-requests afhandelen: externe calls (Google-login,
    // Drive API) mogen nooit gecachet of beantwoord worden door de service worker
    if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

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
