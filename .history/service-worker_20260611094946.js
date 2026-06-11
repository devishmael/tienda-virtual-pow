// service-worker.js - Control de Ciclo de Vida y Caché Offline PWA
const CACHE_NAME = 'ucab-shop-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './data-base.js',
    './authenticator.js',
    './application.js'
];

// Evento de Instalación: Guarda los archivos estáticos en la caché local
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Archivos estáticos guardados en caché con éxito.');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Evento de Activación: Elimina versiones de caché obsoletas
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

// Evento Fetch: Intercepta peticiones de red. Sirve desde caché si está offline.
self.addEventListener('fetch', e => {
    if (e.request.url.includes('fakestoreapi.com')) return;

    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                console.log('SW: Modo Offline activo sirviendo recurso alternativo.');
            });
        })
    );
});