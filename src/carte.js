/* global L, requeteAPI, serveurApi, appliqueDonnees */

/*****************
 * Carte Leaflet *
 *****************/
// Initialise la carte avec les points des Alpes du Nord
let map = null;

const baseLayers = {
  //TODO BUG ligne blanche entre dalles
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

/* GeoJson layer from remote url. Options:
 * iconUrl: '<url>' | function(feature),
 * iconWidth: 16, // (Pixels) for a square icon |
    iconSize: [16, 16],
    iconAnchor: [8, 8],
 * label: '<text>' | function(feature), //TO BE DONE
 * tooltip: '<text>' | function(feature),
 * click: function(feature),
 */
class GeoJsonRemote extends L.geoJson {
  constructor(options) {
    const iw = options.iconWidth || 16;

    super(null, {
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconSize: [iw, iw],
            iconAnchor: [iw / 2, iw / 2],
            ...options,
            iconUrl: typeof options.iconUrl === 'function' ? options.iconUrl(feature) : options.iconUrl,
          }),
        }),

      onEachFeature: (feature, layer) => {
        // Etiquette sur les points
        //TODO permanent label
        if (options.tooltip)
          layer.bindTooltip(
            typeof options.tooltip === 'function' ? options.tooltip(feature) : options.tooltip, {
              direction: 'center',
              offset: L.point(0, -24),
            }
          ).openTooltip();

        // Click
        if (options.click)
          layer.on({
            click: (evt) => options.click(feature, evt),
          });
      },

      ...options,
    });
  }
}

const wriPoiLayer =
  new GeoJsonRemote({
    iconUrl: feature => serveurApi + '/images/icones/' + feature.properties.type.icone + '.svg',
    iconWidth: 24,
    tooltip: feature => feature.properties.nom,
    click: feature => {
      // Affiche les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
      appliqueDonnees('point', feature.properties);

      // Affiche la page point
      window.location.hash = 'point=' + feature.properties.id;
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

    //TODO BUG image controle trop grande sous FF
    new L.Control.Geocoder({
      position: 'topleft',
    }).addTo(map);

    L.Permalink.setup(map); //TODO BUG Interférence permalink templateur

    // Refuges.info points of interest
    wriPoiLayer.addTo(map);
    requeteAPI(
      'cartes',
      '/api/bbox?&nb_points=all&bbox=4.8%2C44.5%2C7.4%2C46.2', // French north Apls
      null,
      json => {
        wriPoiLayer.addData(json);
      }
    );
  }
  map.invalidateSize(); // Recharge la carte

  return map;
}