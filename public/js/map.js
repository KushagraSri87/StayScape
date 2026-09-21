// Leaflet + OpenStreetMap - free, no API key or billing required.
// listing.geometry.coordinates is stored as GeoJSON [lng, lat];
// Leaflet expects [lat, lng], so we flip the order below.
const [lng, lat] = listing.geometry.coordinates;

const map = L.map("map").setView([lat, lng], 9);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  },
).addTo(map);

L.marker([lat, lng])
  .addTo(map)
  .bindPopup(
    `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`,
  )
  .openPopup();
