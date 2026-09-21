// Leaflet + OpenFreeMap (via MapLibre GL) - free, no API key, no limits,
// explicitly built for production apps (unlike raw tile.openstreetmap.org,
// which blocks heavy/app traffic, and CARTO's basemaps, which now require a key).
// listing.geometry.coordinates is stored as GeoJSON [lng, lat];
// Leaflet expects [lat, lng], so we flip the order below.
const [lng, lat] = listing.geometry.coordinates;

const map = L.map("map").setView([lat, lng], 9);

function mapStyleUrl() {
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  return theme === "light"
    ? "https://tiles.openfreemap.org/styles/positron"
    : "https://tiles.openfreemap.org/styles/dark";
}

const glLayer = L.maplibreGL({ style: mapStyleUrl() }).addTo(map);

// Keep the map's style in sync if the theme toggle is clicked while this
// page is open, instead of only matching whichever theme was active on load.
const themeObserver = new MutationObserver(() => {
  glLayer.getMaplibreMap().setStyle(mapStyleUrl());
});
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});

L.marker([lat, lng])
  .addTo(map)
  .bindPopup(
    `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`,
  )
  .openPopup();