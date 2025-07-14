const CACHE_NAME = 'pulsechain-ai-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'index.css',
  'index.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Jost:wght@700&family=Poppins:wght@400;500&display=swap',
  'https://i.imgur.com/3gXhe18.png', // Logo
  'https://imgur.com/oDyZNFQ.jpg',   // App background
  'https://i.imgur.com/YjBbtpx.png'  // AI Avatar
];

// Install the service worker and cache all the app resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't cache requests to the Gemini API
                if (!event.request.url.includes('generativelanguage.googleapis.com')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        );
      }
    )
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
