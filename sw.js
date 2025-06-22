// Service Worker for the Insurance Referral Hub PWA

const CACHE_NAME = 'referral-hub-cache-v2'; // Incremented cache version
const SYNC_TAG = 'sync-new-referrals';

const urlsToCache = [
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
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Source+Serif+Pro:wght@600;700&display=swap'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

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
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // --- FIX: Only handle http/https requests. Ignore chrome-extension etc. ---
  if (!(event.request.url.startsWith('http'))) {
      return; 
  }

  if (event.request.method !== 'GET') {
    return;
  }
  
  // For non-Firestore API calls, use a network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the fetch is successful, cache the response and return it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // If the network fails, try to serve from the cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('sync', event => {
    if (event.tag === SYNC_TAG) {
        console.log('[Service Worker] Sync event triggered for', SYNC_TAG);
        // This functionality still requires IndexedDB integration in the rater files.
        event.waitUntil(
            new Promise((resolve, reject) => {
                console.log("Sync logic to be implemented.");
                resolve();
            })
        );
    }
});
