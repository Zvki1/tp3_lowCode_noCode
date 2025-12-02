// Script pour le jeu des Tours de Hanoï

// Récupération des éléments du DOM
const diskCountInput = document.getElementById('diskCount');
const startBtn = document.getElementById('startBtn');

// Écouteur d'événement sur le bouton Démarrer
startBtn.addEventListener('click', function() {
    const diskCount = parseInt(diskCountInput.value);
    
    // Validation du nombre d'anneaux
    if (diskCount < 1 || diskCount > 8) {
        alert('Veuillez choisir un nombre d\'anneaux entre 1 et 8');
        return;
    }
    
    console.log('Démarrage du jeu avec ' + diskCount + ' anneaux');
});
