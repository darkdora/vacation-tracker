// firebase-config.js - Configuration et initialisation Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCjx3CJAEd6YZTnwvjElYl3dqFc9OthKVw",
    authDomain: "vacation-tracker-app.firebaseapp.com",
    databaseURL: "https://vacation-tracker-app-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vacation-tracker-app",
    storageBucket: "vacation-tracker-app.firebasestorage.app",
    messagingSenderId: "1280185412299",
    appId: "1:1280185412299:web:3c7b3f3276d02ca2b9a586"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

console.log('Firebase initialisé avec succès');
