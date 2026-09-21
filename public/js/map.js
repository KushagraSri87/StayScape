// Leaflet + OpenStreetMap - free, no API key or billing required.
// listing.geometry.coordinates is stored as GeoJSON [lng, lat];
// Leaflet expects [lat, lng], so we flip the order below.
const [lng, lat] = listing.geometry.coordinates;

const map = L.map("map").setView([lat, lng], 9);

L.maplibreGL({
  style: "https://tiles.openfreemap.org/styles/dark",
}).addTo(map);
L.marker([lat, lng])
  .addTo(map)
  .bindPopup(
    `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`,
  )
  .openPopup();
