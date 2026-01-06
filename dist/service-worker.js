/* PWA service worker
 * Instantiates in a context different from the HTML DOM
 */

//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'myWRI',
version=6;

/*DCMM*/console.log(version);
//*DCMM*/alert(version);


// Pour voir tous les Service Workers
//self.getRegistrations().then(console.log);

// Pour voir tous les caches
//caches.keys().then(console.log);

// First event after installing the service worker
self.addEventListener('install', evt => {
  console.info('PWA install');

  // Immediately activate the SW & trigger controllerchange when a server ressource occurs
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  self.skipWaiting();

  // Delete the old cache
  /*    caches.delete(cacheName)
        .then(console.info('PWA ' + cacheName + ' deleted'))
        .catch(error => console.error(error));*/

var urlsToPrefetch = [
  'https://dom.refuges.info/api/bbox?&nb_points=all&detail=minimal',
];

  // Create/install cache
  evt.waitUntil(
    caches.open(cacheName)
    /*
    .then(cache => {
      console.info('PWA open cache ' + cacheName);
      
      if(0)//DCMM
      
      //https://stackoverflow.com/questions/39432717/how-can-i-cache-external-urls-using-service-worker
       // Magic is here. Look the  mode: 'no-cors' part.
        cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
           return new Request(urlToPrefetch, { mode: 'no-cors' });
        })).then(function() {
          console.log('All resources have been fetched and cached.');
        });
        
        if(0)//DCMM
      cache.addAll([
          'index.html',
          'manifest.json',
          //'service-worker.js',
          'src/favicon.svg',
          'src/carte.js',
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
          'https://www.refuges.info/api/bbox?&nb_points=all&detail=minimal',
        ])
        .then(console.info('PWA files added to cache'))
        .catch(error => console.error(error));
    })
    */
    .catch(error => console.error(error))
  );
});

//if(0)//DCMM

// Provides the required files
// Cache first, then browser cache, then network
self.addEventListener('fetch', evt => {
  //console.info('PWA fetch ' + evt.request.url);

  evt.waitUntil(
    caches.open('myWRI')
    .then(cache => {
      console.info('PWA add ' + evt.request.url);
      //console.info('PWA add type ' + (typeof evt.request.url));
//      cache.add('https://tile.openstreetmap.org/8/132/92.png');
    })
  );

  evt.respondWith(
    caches.match(evt.request)
    /* eslint-disable arrow-body-style */
    .then(found => {
      //*DCMM*/console.log(found);
      //*DCMM*/console.log(fetch(evt.request));
      return found || fetch(evt.request);
    })
    .catch(error => console.error(error + ' ' + evt.request.url))
  );
});

// https://blog.bitsrc.io/5-service-worker-caching-strategies-for-your-next-pwa-app-58539f156f52
/* Cache first
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(cacheName)
            .then(function(cache) {
                cache.match(event.request)
                    .then( function(cacheResponse) {
                        if(cacheResponse)
                            return cacheResponse
                        else
                            return fetch(event.request)
                                .then(function(networkResponse) {
                                    cache.put(event.request, networkResponse.clone())
                                    return networkResponse
                                })
                    })
            })
    )
});
*/

/* Network First
self.addEventListener(’fetch’, function (event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request)
        })
    )
});
*/