const CACHE_NAME = 'xperiencestore-v1';
const STATIC_ASSETS = [
    '/', '/index.html', '/script.js', '/styles.css',
    '/router.js', '/auth.js', '/state.js', '/components.js',
    '/pages.js', '/data.js', '/payment.js', '/paymentModal.js',
    '/tracking.js', '/logger.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[ServiceWorker] Caching offline assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Never cache API calls or external domains dynamically
    if (e.request.url.includes('/api/') || !e.request.url.startsWith(self.location.origin)) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            return cachedResponse || fetch(e.request).then(fetchResponse => {
                // Optionally cache dynamically loaded images or assets here
                return fetchResponse;
            }).catch(() => {
                // If network fails, and it's a navigation request, we could serve an offline page
                if (e.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
