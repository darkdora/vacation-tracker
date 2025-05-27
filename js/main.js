// main.js – logique principale du site

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initDatePicker();
    registerServiceWorker();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log("Service Worker enregistré :", reg.scope))
            .catch(err => console.warn("Erreur SW :", err));
    }
}
