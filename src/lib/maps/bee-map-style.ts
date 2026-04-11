// Style Google Maps custom — thème BEE dark
// Inspiré du dashboard livreur : fond #0f0f13, accents #22d3a5 et #9b7fff
// À passer dans l'option `styles` du constructeur google.maps.Map

export const BEE_MAP_STYLE = [
  // ── Fond global ────────────────────────────────────────────────────────
  {
    elementType: "geometry",
    stylers: [{ color: "#0f0f13" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f0f13" }],
  },

  // ── Routes principales ─────────────────────────────────────────────────
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e1e2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#16161d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#252535" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2d2d45" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9b7fff" }], // accent violet sur les autoroutes
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#1a1a24" }],
  },

  // ── Eau ───────────────────────────────────────────────────────────────
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0a14" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1e3a5f" }],
  },

  // ── Parcs / végétation ─────────────────────────────────────────────────
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#111118" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0d1a12" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1a3d25" }],
  },

  // ── Zones commerciales / bâtiments ─────────────────────────────────────
  {
    featureType: "landscape.man_made",
    elementType: "geometry",
    stylers: [{ color: "#13131c" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#13131c" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },

  // ── Transit ────────────────────────────────────────────────────────────
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0f0f1a" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#374151" }],
  },

  // ── Frontières administratives ─────────────────────────────────────────
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1e1e2e" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9b7fff" }], // noms de ville en violet
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#374151" }],
  },
];
