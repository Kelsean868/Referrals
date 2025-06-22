// Service Worker for the Insurance Referral Hub PWA

// Increment this version number whenever you make changes to the app shell files.
// This will trigger the service worker update process.
const CACHE_NAME = 'referral-hub-cache-v5'; 

const SYNC_TAG = 'sync-new-referrals';

// A list of all the essential files the app needs to function offline.
const URLS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './profile.html',
  './motor_rater.html',
  './health_rater.html',
  './property_rater.html',
  './motor_rater_data.js',
  './health_rater_data.js',
  './property_rater_data.js',
  './manifest.json',
  // Note: External CDN resources are not pre-cached here to avoid CORS issues during install.
  // The 'fetch' event handler will cache them on-the-fly when they are first requested.
];

/**
 * When the service worker is installed, open a new cache and add all the essential app files to it.
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

/**
 * When the new service worker activates, find and delete any old, outdated caches.
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});

/**
 * Intercept all network requests.
 * Strategy: Cache First. Try to serve the request from the cache. If it's not in the cache,
 * fetch it from the network, put a copy in the cache for next time, and then return the response.
 */
self.addEventListener('fetch', event => {
  // We only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the resource is in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's not in the cache, fetch it from the network.
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response.
            // Some third-party resources (like CDNs) might return an "opaque" response
            // which is still valid to cache.
            if (!response || (response.status !== 200 && response.type !== 'opaque')) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
