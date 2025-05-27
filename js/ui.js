// ui.js - Gestion de l'interface utilisateur

import { getCountryEmoji, formatDate, createTrip, selectTrip } from './trips.js';
import { loadTripOnMap, setMapMode, invalidateMapSize } from './map.js';

// Variables d'état UI
let currentView = 'trips';

// Initialiser l'interface
export function initUI() {
    // Boutons et événements
    document.getElementById('viewToggle').addEventListener('click', toggleView);
    document.getElementById('fab').addEventListener('click', openNewTripModal);
    document.getElementById('newTripForm').addEventListener('submit', handleCreateTrip);
    
    // Boutons de la carte
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = btn.dataset.mode;
            setMapMode(mode);
            
            // Mettre à jour les classes actives
            document.querySelectorAll('.map-control-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Fermeture des modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
        });
    });
    
    // Clic en dehors des modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Basculer entre les vues
function toggleView() {
    if (currentView === 'trips') {
        currentView = 'map';
        document.getElementById('tripsView').classList.remove('active');
        document.getElementById('mapView').classList.add('active');
        document.getElementById('headerTitle').textContent = 'Carte';
        document.getElementById('fab').style.display = 'none';
        
        // Rafraîchir la carte
        invalidateMapSize();
    } else {
        currentView = 'trips';
        document.getElementById('mapView').classList.remove('active');
        document.getElementById('tripsView').classList.add('active');
        document.getElementById('headerTitle').textContent = 'Mes Voyages';
        document.getElementById('fab').style.display = 'flex';
    }
}

// Mettre à jour la liste des voyages
export function updateTripsList(trips) {
    const tripsList = document.getElementById('tripsList');
    const emptyState = document.getElementById('emptyState');
    
    if (Object.keys(trips).length === 0) {
        emptyState.style.display = 'block';
        tripsList.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    tripsList.innerHTML = '';
    
    // Créer les cartes de voyage
    Object.entries(trips).forEach(([tripId, trip]) => {
        const card = createTripCard(tripId, trip);
        tripsList.appendChild(card);
    });
}

// Créer une carte de voyage
function createTripCard(tripId, trip) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    
    const emoji = getCountryEmoji(trip.country);
    const startDate = formatDate(trip.startDate);
    const endDate = formatDate(trip.endDate);
    
    // Compter les étapes
    const stepsCount = trip.steps ? Object.keys(trip.steps).length : 0;
    
    card.innerHTML = `
        <div class="trip-card-header">
            ${emoji}
        </div>
        <div class="trip-card-content">
            <div class="trip-card-title">${trip.name}</div>
            <div class="trip-card-date">${startDate} - ${endDate}</div>
            <div class="trip-card-stats">
                <div class="trip-stat">
                    <span>📍</span>
                    <span>${stepsCount} étapes</span>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openTrip(tripId, trip));
    
    return card;
}

// Ouvrir un voyage
async function openTrip(tripId, trip) {
    // Sélectionner le voyage
    selectTrip(tripId);
    
    // Basculer vers la vue carte
    if (currentView === 'trips') {
        toggleView();
    }
    
    // Mettre à jour le titre
    document.getElementById('headerTitle').textContent = trip.name;
    
    // Charger les étapes sur la carte
    await loadTripOnMap(tripId);
}

// Ouvrir le modal de nouveau voyage
function openNewTripModal() {
    document.getElementById('newTripModal').style.display = 'block';
}

// Fermer un modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Réinitialiser le formulaire si c'est le modal de voyage
    if (modalId === 'newTripModal') {
        document.getElementById('newTripForm').reset();
    }
}

// Gérer la création d'un voyage
async function handleCreateTrip(e) {
    e.preventDefault();
    
    const tripData = {
        name: document.getElementById('tripName').value,
        country: document.getElementById('tripCountry').value,
        startDate: document.getElementById('tripStartDate').value,
        endDate: document.getElementById('tripEndDate').value
    };
    
    try {
        await createTrip(tripData);
        closeModal('newTripModal');
        showNotification('Voyage créé avec succès !');
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        showNotification('Erreur lors de la création du voyage', 'error');
    }
}

// Afficher une notification
function showNotification(message, type = 'success') {
    // Pour l'instant, on utilise console.log
    // Tu pourras ajouter une vraie notification plus tard
    console.log(`[${type}] ${message}`);
}
