/* PWA service worker
 * Instantiates in a context different from the HTML DOM
 */
//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'myWRI';

// First event after installing the service worker
self.addEventListener('install', evt => {
  console.info('PWA install');

  // Necessary for automatic files add, immediately activate the SW & trigger controllerchange
  self.skipWaiting();

  // Open/install cache
  evt.waitUntil(
    caches.open(cacheName)
    .catch(error => 'Error opening cache ' + cacheName + ': ' + console.error(error))
  );
});

// Provides the required files
// Cache first, then browser cache, then network
self.addEventListener('fetch', evt => {
  evt.waitUntil(
    caches.open(cacheName)
    .then(() => console.info('PWA add ' + evt.request.url))
    .catch(error => 'Error adding ' + evt.request.url + ': ' + console.error(error))
  );

  evt.respondWith(
    caches.match(evt.request)
    .then(found => found || fetch(evt.request))
    .catch(error => 'Error matching ' + evt.request.url + ': ' + console.error(error))
  );
});