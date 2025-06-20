// Service Worker for the Insurance Referral Hub PWA

const CACHE_NAME = 'referral-hub-cache-v1';
const SYNC_TAG = 'sync-new-referrals';

// List of all essential files to be cached for offline use.
// This includes all HTML pages, data scripts, and critical third-party libraries.
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

// --- INSTALLATION: Cache all essential app assets ---
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache', error);
      })
  );
});

// --- ACTIVATION: Clean up old caches ---
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

// --- FETCH: Serve cached content when offline ---
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For Firebase Firestore requests, always try the network first.
  if (event.request.url.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // This is a basic offline handler for Firestore.
        // In a more complex app, you might return a custom offline response.
        console.warn('[Service Worker] Firestore request failed, user is likely offline.');
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from the network, cache it, and return it
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed; returning offline page instead.', error);
            // Optional: return a fallback offline page, e.g. caches.match('offline.html');
          });
      })
  );
});


// --- BACKGROUND SYNC: For offline referral submissions ---
// This part requires more advanced setup within the app logic itself.
// The rater pages would need to detect they are offline and save the referral
// data to IndexedDB with a 'needs-sync' flag.

self.addEventListener('sync', event => {
    if (event.tag === SYNC_TAG) {
        console.log('[Service Worker] Sync event triggered for', SYNC_TAG);
        // This is where you would put the logic to read from IndexedDB
        // and re-submit the queued referrals to Firestore.
        // This functionality requires IndexedDB integration in the rater files,
        // which is a significant addition.
        event.waitUntil(
            // Example placeholder for the sync logic
            new Promise((resolve, reject) => {
                console.log("Pretending to sync offline data...");
                // In a real implementation:
                // 1. Open IndexedDB
                // 2. Get all records flagged for sync
                // 3. Loop and fetch/POST to Firestore
                // 4. On success, remove flag or delete record from IndexedDB
                // 5. On failure, leave for next sync
                setTimeout(resolve, 3000); // Simulate network activity
            })
        );
    }
});
