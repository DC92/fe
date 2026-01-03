/* global L, serveurApi, appliqueDonnees */

//TODO simplifier API WRI

/*****************
 * Carte Leaflet *
 *****************/
let map = null;

const baseLayers = {
  OpenHikingMap: L.tileLayer('https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap">© OpenHikingMap</a>|' +
      '<a href="https://openmaps.fr/donate">❤️ Donation</a>|' +
      '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a>|' +
      '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/OpenHikingMap#Map_Legend">Légende</a>',
  }),
  OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>|' +
      '<a target="_blank" href="https://www.openstreetmap.org/panes/legend">Légende</a>'
  }),

  // https://geoservices.ign.fr/documentation/services/utilisation-web/extension-pour-leaflet
  // https://ignf.github.io/geoportal-extensions/leaflet-latest/jsdoc/module-Layers.html#.WMTS
  /* eslint-disable-next-line new-cap */
  'Ign plan': L.geoportalLayer.WMTS({
    //TODO BUG format non pris en compte
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    format: 'image/png', //TODO BUG
    'attribution': 'Orthophotos - Carte © IGN/Geoportail',
    'maxNativeZoom': 19,
    'maxZoom': 22,
  }),
  /* eslint-disable-next-line new-cap */
  'Ign photo': L.geoportalLayer.WMTS({
    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  }),
};

const wriClusterLayer = new L.MarkerClusterGroup(),
  wriPoiLayer = L.geoJson(
    JSON.parse(localStorage.getItem('poiwri')), { // First init with stored data
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            iconUrl: serveurApi + '/images/icones/' + feature.properties.type.icone + '.svg',
          }),
        }),

      onEachFeature: (feature, layer) => {
        // Etiquette sur les points
        layer.bindTooltip(
          feature.properties.nom, {
            permanent: true,
            direction: 'center',
            offset: L.point(0, -16),
            opacity: 0.6,
          }
        ).openTooltip();

        // Click
        layer.on({
          click: () => {
            // Affiche les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
            appliqueDonnees('point', feature.properties);

            // Affiche la page point
            window.location.hash = 'point=' + feature.properties.id;
          },
        });
      },
    });

/* eslint-disable-next-line no-unused-vars */
function initCarte() {
  if (!map) {
    map = L.map('map');

    // Layer switcher
    Object.values(baseLayers)[0].addTo(map); // Default layer
    L.control.layers(baseLayers).addTo(map);

    new L.Control.Fullscreen().addTo(map);

    //TODO BUG image controle trop grande sous FF
    new L.Control.Gps({
      autoCenter: true,
    }).addTo(map);

    //TODO BUG image bouton trop grande sous FF
    new L.Control.Geocoder({
      position: 'topleft',
    }).addTo(map);

    L.Permalink.setup(map); //TODO BUG Interférence permalink templateur

    // WRI poi & clusters
    wriPoiLayer.addTo(wriClusterLayer);
    wriClusterLayer.addTo(map);

    // Refresh poiwri when available from server
    (async function() {
      const response = await fetch(serveurApi + '/api/bbox?&nb_points=all'),
        json = await response.json();
      localStorage.setItem('poiwri', JSON.stringify(json));
      wriPoiLayer.clearLayers();
      wriClusterLayer.clearLayers();
      wriPoiLayer.addData(json);
      wriClusterLayer.addLayer(wriPoiLayer);
    })();
  }

  return map;
}