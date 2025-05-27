// main.js - Point d'entrée principal de l'application

import { loadTrips, state } from './trips.js';
import { initMap } from './map.js';
import { initUI, updateTripsList } from './ui.js';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation de Vacation Tracker...');
    
    // Initialiser l'interface
    initUI();
    
    // Initialiser la carte
    initMap();
    
    // Charger les voyages depuis Firebase
    loadTrips((trips) => {
        updateTripsList(trips);
    });
    
    // Enregistrer le Service Worker
    registerServiceWorker();
});

// Enregistrement du Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker enregistré:', reg.scope))
            .catch(err => console.warn('Erreur Service Worker:', err));
    }
}
