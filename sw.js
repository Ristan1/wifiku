const CACHE_NAME = 'wifipay-v3'; // Naik versi ke v3

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
        'https://unpkg.com/@phosphor-icons/web'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Abaikan permintaan selain GET (seperti POST untuk kirim data) dan abaikan API Google Apps Script
  if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Ambil dari cache, tapi diam-diam perbarui dari internet di latar belakang (Stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        }).catch(() => {});
        return cachedResponse;
      }
      
      // Jika belum ada di cache (seperti file font ikon), ambil dari internet lalu simpan ke cache
      return fetch(event.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      }).catch(() => {}); // Tetap aman walau offline
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
