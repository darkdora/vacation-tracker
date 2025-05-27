// map.js - Gestion de la carte Leaflet et des marqueurs

import { addStep, getTripSteps } from './trips.js';
import { state } from './trips.js';

// Variables globales pour la carte
let map = null;
let markers = [];
let polylines = [];
let mapMode = 'view';
let searchMarker = null;

// Initialiser la carte
export function initMap() {
    // Créer la carte centrée sur la France
    map = L.map('map').setView([46.603354, 1.888334], 6);
    
    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Gestionnaire de clic sur la carte
    map.on('click', handleMapClick);
    
    // Initialiser la recherche
    initSearch();
    
    return map;
}

// Gérer les clics sur la carte
function handleMapClick(e) {
    if (mapMode === 'add' && state.currentTrip) {
        addMarkerAtLocation(e.latlng);
    }
}

// Ajouter un marqueur à une position
async function addMarkerAtLocation(latlng) {
    const stepNumber = markers.length + 1;
    
    // Créer l'icône personnalisée avec croix de suppression
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="position: relative;">
                <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${stepNumber}</div>
                <button onclick="window.removeStep(${stepNumber - 1})" style="position: absolute; top: -8px; right: -8px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">×</button>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Créer le marqueur
    const marker = L.marker(latlng, { icon }).addTo(map);
    marker.bindPopup(`Étape ${stepNumber}`).openPopup();
    markers.push(marker);
    
    // Tracer la ligne si nécessaire
    updatePolylines();
    
    // Sauvegarder dans Firebase
    const stepRef = await addStep(state.currentTrip, {
        lat: latlng.lat,
        lng: latlng.lng,
        order: stepNumber
    });
    
    // Stocker l'ID Firebase dans le marqueur
    marker.stepId = stepRef;
}

// Mettre à jour les lignes entre les marqueurs
function updatePolylines() {
    // Supprimer les anciennes lignes
    polylines.forEach(polyline => map.removeLayer(polyline));
    polylines = [];
    
    // Tracer de nouvelles lignes si plus d'un marqueur
    if (markers.length > 1) {
        const latlngs = markers.map(m => m.getLatLng());
        const polyline = L.polyline(latlngs, {
            color: '#667eea',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10'
        }).addTo(map);
        polylines.push(polyline);
    }
}

// Charger les étapes d'un voyage sur la carte
export async function loadTripOnMap(tripId) {
    // Nettoyer la carte
    clearMap();
    
    // Charger les étapes
    const steps = await getTripSteps(tripId);
    
    if (steps) {
        // Convertir en tableau et trier par ordre
        const stepsArray = Object.entries(steps)
            .map(([id, step]) => ({ id, ...step }))
            .sort((a, b) => a.order - b.order);
        
        // Ajouter les marqueurs
        stepsArray.forEach((step, index) => {
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker([step.lat, step.lng], { icon }).addTo(map);
            marker.bindPopup(`Étape ${index + 1}`);
            markers.push(marker);
        });
        
        // Tracer les lignes
        updatePolylines();
        
        // Ajuster la vue
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Nettoyer la carte
function clearMap() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    polylines.forEach(polyline => map.removeLayer(polyline));
    polylines = [];
}

// Définir le mode de la carte
export function setMapMode(mode) {
    mapMode = mode;
    
    // Mettre à jour l'interface
    const stepInfo = document.getElementById('stepInfo');
    if (mode === 'add' && state.currentTrip) {
        stepInfo.classList.add('active');
    } else {
        stepInfo.classList.remove('active');
    }
}

// Initialiser la recherche
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Débounce de 500ms
        searchTimeout = setTimeout(() => {
            searchLocation(query);
        }, 500);
    });
}

// Rechercher un lieu (avec l'API Nominatim d'OpenStreetMap)
async function searchLocation(query) {
    const searchResults = document.getElementById('searchResults');
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&lang=fr`
        );
        const results = await response.json();
        
        if (results.length > 0) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'block';
            
            results.forEach(result => {
                const div = document.createElement('div');
                div.className = 'search-result';
                div.textContent = result.display_name;
                div.onclick = () => {
                    selectSearchResult(result);
                };

// Fonction globale pour supprimer une étape
window.removeStep = async function(index) {
                searchResults.appendChild(div);
            });
        } else {
            searchResults.style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur de recherche:', error);
        searchResults.style.display = 'none';
    }
}

// Sélectionner un résultat de recherche
function selectSearchResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Centrer la carte
    map.setView([lat, lng], 15);
    
    // Supprimer l'ancien marqueur de recherche
    if (searchMarker) {
        map.removeLayer(searchMarker);
    }
    
    // Ajouter un marqueur temporaire
    searchMarker = L.marker([lat, lng]).addTo(map);
    searchMarker.bindPopup(result.display_name).openPopup();
    
    // Cacher les résultats
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
}

// Invalider la taille de la carte (utile après changement de vue)
export function invalidateMapSize() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}
