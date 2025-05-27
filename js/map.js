// map.js – gestion de la carte Leaflet

function initMap() {
    const map = L.map('map').setView([44.8378, -0.5792], 13); // Bordeaux
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
    }).addTo(map);

    L.marker([44.8378, -0.5792]).addTo(map)
        .bindPopup('Bordeaux')
        .openPopup();
}
