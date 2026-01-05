/** 
 */
/* global L, serveurApi */

/* eslint-disable no-unused-vars */
class GeoJsonAjaxCluster extends L.MarkerClusterGroup {
  constructor(options) {
    super();

    const iw = options.icon.width || 16,
      clusterLayer = this,
      poiLayer = L.geoJson(null, {
        pointToLayer: (feature, latlng) =>
          //TODO Sélecteur type points / autres couches vectorielles
          //TODO Dedoubler points proches
          L.marker(latlng, {
            icon: L.icon({
              iconSize: [iw, iw],
              iconAnchor: [iw / 2, iw / 2],
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
              //TODO move to cartes.js
              appliqueDonnees('point', feature.properties);

              // Affiche la page point
              window.location.hash = 'point=' + feature.properties.id;
            },
          });
        },
      });

    // Load features from url
    (async function() {
      const response = await fetch(serveurApi + options.url),
        json = await response.json();

      poiLayer.addData(json);
      clusterLayer.addLayer(poiLayer);
    })();
  }
}

/////////////////////////////////////