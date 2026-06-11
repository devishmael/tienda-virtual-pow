const CACHE_NAME = 'ucab-shop-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './db.js',
    './auth.js',
    './app.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Archivos estáticos guardados en caché con éxito.');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('SW: Eliminando caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Evento Fetch: Intercepta las peticiones de red. Si no hay internet, sirve desde la caché.
self.addEventListener('fetch', e => {
    // Ignorar peticiones a la API externa para que no choquen con la estrategia híbrida de db.js
    if (e.request.url.includes('fakestoreapi.com')) return;

    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Retorna el archivo desde la caché local
            }
            return fetch(e.request).catch(() => {
                console.log('SW: Modo Offline activo sirviendo recurso alternativo.');
            });
        })
    );
});