const CACHE_NAME = 'xperiencestore-v3';
const STATIC_ASSETS = [
    '/', '/index.html', '/styles.css',
    '/dist/output.css', '/assets/logo.png', '/assets/favicon.png'
];

// JS modules use network-first - always fetch fresh, fall back to cache
const JS_MODULES = [
    '/script.js', '/router.js', '/auth.js', '/state.js', '/components.js',
    '/pages.js', '/data.js', '/payment.js', '/paymentModal.js',
    '/tracking.js', '/logger.js', '/support.js', '/seo.js', '/gigo.js',
    '/chat.js', '/paymentModal.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[ServiceWorker] Caching static assets (v2)');
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
                    console.log('[ServiceWorker] Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Never intercept API calls or external domains
    if (e.request.url.includes('/api/') || url.origin !== self.location.origin) {
        return;
    }

    // Network-first for JS modules - always get fresh code
    const isJSModule = JS_MODULES.some(m => url.pathname === m || url.pathname.startsWith(m));
    if (isJSModule || url.pathname.endsWith('.js')) {
        e.respondWith(
            fetch(e.request).then(res => {
                // Clone and cache the fresh response
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                return res;
            }).catch(() => caches.match(e.request))
        );
        return;
    }

    // Cache-first for static assets (CSS, images)
    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(res => {
                return res;
            }).catch(() => {
                if (e.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
