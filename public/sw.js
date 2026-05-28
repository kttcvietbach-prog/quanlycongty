// Service Worker for PWA caching
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('vb-erp-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

