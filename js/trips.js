// trips.js - Gestion des voyages et des étapes

import { ref, push, set, get, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { db } from './firebase-config.js';

// État global
export const state = {
    trips: {},
    currentTrip: null,
    callbacks: {
        onTripsUpdate: null,
        onTripSelect: null
    }
};

// Charger les voyages depuis Firebase
export function loadTrips(callback) {
    const tripsRef = ref(db, 'trips');
    onValue(tripsRef, (snapshot) => {
        const data = snapshot.val();
        state.trips = data || {};
        if (callback) callback(state.trips);
    });
}

// Créer un nouveau voyage
export async function createTrip(tripData) {
    try {
        const tripsRef = ref(db, 'trips');
        const newTripRef = await push(tripsRef, {
            ...tripData,
            createdAt: Date.now(),
            steps: {}
        });
        return newTripRef.key;
    } catch (error) {
        console.error('Erreur lors de la création du voyage:', error);
        throw error;
    }
}

// Ajouter une étape à un voyage
export async function addStep(tripId, stepData) {
    try {
        const stepsRef = ref(db, `trips/${tripId}/steps`);
        const newStepRef = await push(stepsRef, {
            ...stepData,
            timestamp: Date.now()
        });
        return newStepRef.key; // Retourner l'ID de l'étape
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'étape:', error);
        throw error;
    }
}

// Obtenir les étapes d'un voyage
export async function getTripSteps(tripId) {
    try {
        const stepsRef = ref(db, `trips/${tripId}/steps`);
        const snapshot = await get(stepsRef);
        return snapshot.val() || {};
    } catch (error) {
        console.error('Erreur lors du chargement des étapes:', error);
        return {};
    }
}

// Sélectionner un voyage
export function selectTrip(tripId) {
    state.currentTrip = tripId;
    if (state.callbacks.onTripSelect) {
        state.callbacks.onTripSelect(tripId, state.trips[tripId]);
    }
}

// Obtenir l'emoji du pays
export function getCountryEmoji(country) {
    const emojis = {
        'canada': '🇨🇦',
        'france': '🇫🇷',
        'usa': '🇺🇸',
        'états-unis': '🇺🇸',
        'espagne': '🇪🇸',
        'italie': '🇮🇹',
        'japon': '🇯🇵',
        'australie': '🇦🇺',
        'royaume-uni': '🇬🇧',
        'angleterre': '🇬🇧',
        'allemagne': '🇩🇪',
        'brésil': '🇧🇷',
        'mexique': '🇲🇽',
        'inde': '🇮🇳',
        'chine': '🇨🇳',
        'belgique': '🇧🇪',
        'suisse': '🇨🇭',
        'portugal': '🇵🇹',
        'grèce': '🇬🇷',
        'maroc': '🇲🇦',
        'thailande': '🇹🇭',
        'default': '🌍'
    };
    
    const key = country.toLowerCase();
    return emojis[key] || emojis['default'];
}

// Formater une date
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}
