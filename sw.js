const CACHE_NAME = 'pulsechain-ai-v2';
const STATIC_CACHE = 'static-v2';
const API_CACHE = 'api-v2';

const STATIC_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/index.css',
  '/index.tsx',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Jost:wght@700&family=Poppins:wght@400;500&display=swap',
  'https://imgur.com/nLgleP7', // Logo
  'https://imgur.com/oDyZNFQ.jpg',   // App background
  'https://i.imgur.com/YjBbtpx.png'  // AI Avatar
];

// Install the service worker and cache all the app resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_URLS_TO_CACHE);
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('API cache ready');
        return cache;
      })
    ])
  );
  self.skipWaiting();
});

// Activate event: clean up old caches and take control
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
  }
});

async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for API request:', request.url);
  }

  // Fallback to cached response if available
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline fallback for chat API
  if (request.url.includes('/api/chat')) {
    return new Response(JSON.stringify({
      text: "I'm currently offline. Please check your internet connection and try again."
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}

async function handleStaticRequest(request) {
  // Check cache first for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Try network if not in cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses (except for external resources)
      if (request.url.startsWith(self.location.origin)) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for static request:', request.url);
  }

  // Return offline fallback for HTML requests
  if (request.destination === 'document') {
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    return caches.match('/index.html');
  }

  return new Response('Not Found', { status: 404 });
}
