const CACHE_NAME = 'hnverbook-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

// Install event - Cache files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - Serve cached content and update cache later
self.addEventListener('fetch', (event) => {
   
  if (requestUrl.pathname.startsWith('/icon/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve the cached response if it's found
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update the cache with the new response
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
      // Return the cached response immediately, but update the cache in the background
      return cachedResponse || fetchPromise;
    })
  );
  }
});

// Activate event - Cleanup old caches
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});