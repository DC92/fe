/* PWA service worker
 * Instantiates in a context different from the HTML DOM
 */

//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'myWRI';
// First event after installing the service worker
self.addEventListener('install', evt => {
  console.info('PWA install');

  // Immediately activate the SW & trigger controllerchange when a server ressource occurs
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  //TODO ??? self.skipWaiting();

  // Create/install cache
  evt.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      console.info('PWA open cache ' + cacheName);

      cache.addAll([
          'index.html',
          'manifest.json',
          //'service-worker.js',
          'src/favicon.svg',
          'src/carte.js',
          /*
          'assets/leaflet/leaflet.css',
          'assets/leaflet/leaflet.js',
          'src/index.css',
          'src/index.js',
          'src/templeteur.js',

          'assets/fullscreen/leaflet.fullscreen.css',
          'assets/fullscreen/Leaflet.fullscreen.min.js',
          'assets/geocoder/Control.Geocoder.css',
          'assets/geocoder/Control.Geocoder.js',
          'assets/gps/leaflet-gps.min.css',
          'assets/gps/leaflet-gps.min.js',
          'assets/permalink/leaflet.permalink.min.js',
          'assets/ign/GpPluginLeaflet.js',
          'assets/ign/GpPluginLeaflet.css',
          'assets/markercluster/MarkerCluster.css',
          'assets/markercluster/MarkerCluster.Default.css',
          'assets/markercluster/leaflet.markercluster-src.js',
          */
          'https://www.refuges.info/api/bbox?&nb_points=all&detail=minimal',
        ])
        .then(console.info('PWA files added to cache'))
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error))
  );
});

// Provides the required files
// Cache first, then browser cache, then network
self.addEventListener('fetch', evt => {
  evt.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      console.info('PWA add ' + evt.request.url);
    })
  );

  evt.respondWith(
    caches.match(evt.request)
    /* eslint-disable arrow-body-style */
    .then(found => {
      return found || fetch(evt.request);
    })
    .catch(error => console.error(error + ' ' + evt.request.url))
  );
});