const CACHE_NAME = 'hotel-himalaya-v1';
const RUNTIME_CACHE = 'hotel-himalaya-runtime';
const ASSET_CACHE = 'hotel-himalaya-assets';

// Assets to cache immediately on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/main.jsx',
  '/App.jsx',
  '/favicon.ico'
];

// API endpoints that benefit from caching
const CACHEABLE_APIS = [
  '/api/attractions',
  '/api/categories',
  '/api/rooms/available',
  '/api/gallery'
];

// Install: Cache critical assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS).catch(() => {
        // Some assets might fail - that's ok, continue
        console.log('[ServiceWorker] Some critical assets failed to cache');
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== ASSET_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(networkFirstStrategy(request));
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    return event.respondWith(cacheFirstStrategy(request));
  }

  // Handle HTML with network-first strategy
  if (request.mode === 'navigate') {
    return event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Network-first strategy: Try network, fallback to cache
 * Good for: API calls, frequently updated content
 */
async function networkFirstStrategy(request) {
  const cacheName = request.url.includes('/api/') ? RUNTIME_CACHE : CACHE_NAME;
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page or generic response
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first strategy: Try cache, fallback to network
 * Good for: Static assets, images, scripts
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }
  
  try {
    console.log('[ServiceWorker] Fetching:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, no cache:', request.url);
    
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="14">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const extensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.png', '.jpg', '.jpeg', '.gif'];
  return extensions.some(ext => pathname.endsWith(ext));
}

/**
 * Message handling for client communication
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      console.log('[ServiceWorker] Runtime cache cleared');
    });
  }
  
  if (event.data.type === 'CLEAR_ALL') {
    caches.keys().then((names) => {
      Promise.all(names.map(name => caches.delete(name)));
      console.log('[ServiceWorker] All caches cleared');
    });
  }
});
