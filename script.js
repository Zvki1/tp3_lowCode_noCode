// Script pour le jeu des Tours de Hanoï

// Récupération des éléments du DOM
const diskCountInput = document.getElementById("diskCount");
const startBtn = document.getElementById("startBtn");
const demoBtn = document.getElementById("demoBtn");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const towers = document.querySelectorAll(".tower");
const moveCountDisplay = document.getElementById("moveCount");
const minMovesDisplay = document.getElementById("minMoves");
const scoreDisplay = document.getElementById("score");
const victoryModal = document.getElementById("victoryModal");
const victoryMessage = document.getElementById("victoryMessage");
const victoryCloseBtn = document.getElementById("victoryCloseBtn");

// Couleurs pour les anneaux (avec dégradés)
const diskColors = [
  { base: "#FF6B6B", light: "#FF8E8E", dark: "#E84545" }, // Rouge
  { base: "#4ECDC4", light: "#7EDDD6", dark: "#36B5AD" }, // Turquoise
  { base: "#45B7D1", light: "#6FC9DF", dark: "#2E9AB8" }, // Bleu clair
  { base: "#96CEB4", light: "#B5DEC9", dark: "#7ABF9E" }, // Vert menthe
  { base: "#FFEAA7", light: "#FFF2C4", dark: "#F5D985" }, // Jaune
  { base: "#DDA0DD", light: "#E8BFE8", dark: "#C882C8" }, // Violet clair
  { base: "#98D8C8", light: "#B5E5D9", dark: "#7BCBB7" }, // Vert eau
  { base: "#F7DC6F", light: "#FAE89F", dark: "#F4CE3A" }, // Or
];

// Variables d'état du jeu
let selectedDisk = null;
let sourceTower = null;
let isAnimating = false;
let animationSpeed = 500;
let moveCount = 0;
let currentDiskCount = 0;
let gameStarted = false;
let isDarkMode = true;

// ==================== COMPTEUR ET SCORE ====================

// Fonction pour calculer le nombre minimum de coups
function calculateMinMoves(n) {
  return Math.pow(2, n) - 1;
}

// Fonction pour mettre à jour l'affichage du compteur
function updateMoveCount() {
  moveCountDisplay.textContent = moveCount;
  updateScore();
}

// Fonction pour mettre à jour le score
function updateScore() {
  if (!gameStarted || currentDiskCount === 0) {
    scoreDisplay.textContent = "-";
    return;
  }

  const minMoves = calculateMinMoves(currentDiskCount);
  if (moveCount === 0) {
    scoreDisplay.textContent = "100%";
  } else if (moveCount <= minMoves) {
    scoreDisplay.textContent = "100%";
  } else {
    const efficiency = Math.max(0, Math.round((minMoves / moveCount) * 100));
    scoreDisplay.textContent = efficiency + "%";
  }
}

// Fonction pour réinitialiser le compteur
function resetMoveCount() {
  moveCount = 0;
  updateMoveCount();
}

// Fonction pour incrémenter le compteur
function incrementMoveCount() {
  moveCount++;
  updateMoveCount();
}

// Fonction pour générer les anneaux sur la première tour
function generateDisks(count) {
  // Nettoyer toutes les tours
  const disks1 = document.getElementById("disks1");
  const disks2 = document.getElementById("disks2");
  const disks3 = document.getElementById("disks3");

  disks1.innerHTML = "";
  disks2.innerHTML = "";
  disks3.innerHTML = "";

  // Réinitialiser la sélection et le compteur
  selectedDisk = null;
  sourceTower = null;
  currentDiskCount = count;
  gameStarted = true;
  resetMoveCount();

  // Mettre à jour l'affichage du minimum
  minMovesDisplay.textContent = calculateMinMoves(count);

  // Largeur minimale et maximale des anneaux
  const minWidth = 40;
  const maxWidth = 160;
  const diskHeight = 20;

  // Calculer l'incrément de largeur
  const widthIncrement = (maxWidth - minWidth) / (count - 1 || 1);

  // Générer les anneaux du plus grand au plus petit
  // Le plus grand (index count) sera en bas
  for (let i = count; i >= 1; i--) {
    const disk = document.createElement("div");
    disk.classList.add("disk");
    disk.dataset.size = i;

    // Calculer la largeur de l'anneau
    const width = minWidth + (i - 1) * widthIncrement;

    disk.style.width = width + "px";
    disk.style.height = diskHeight + "px";

    // Appliquer le dégradé de couleur
    const colorIndex = (i - 1) % diskColors.length;
    const color = diskColors[colorIndex];
    disk.style.background = `linear-gradient(180deg, ${color.light} 0%, ${color.base} 50%, ${color.dark} 100%)`;

    disks1.appendChild(disk);
  }

  // Ajouter les écouteurs de clic sur les anneaux
  addDiskListeners();

  // Fermer le modal de victoire si ouvert
  hideVictoryModal();
}

// Fonction pour ajouter les écouteurs sur les anneaux
function addDiskListeners() {
  const allDisks = document.querySelectorAll(".disk");
  allDisks.forEach((disk) => {
    disk.addEventListener("click", handleDiskClick);
  });
}

// Fonction pour obtenir l'anneau du dessus d'une tour
function getTopDisk(towerElement) {
  const disksContainer = towerElement.querySelector(".disks");
  const disks = disksContainer.querySelectorAll(".disk");
  if (disks.length === 0) return null;
  // Le dernier enfant est l'anneau du dessus (grâce à column-reverse)
  return disks[disks.length - 1];
}

// Fonction pour gérer le clic sur un anneau
function handleDiskClick(event) {
  event.stopPropagation();
  const clickedDisk = event.target;
  const tower = clickedDisk.closest(".tower");
  const topDisk = getTopDisk(tower);

  // On ne peut sélectionner que l'anneau du dessus
  if (clickedDisk !== topDisk) {
    return;
  }

  // Si aucun anneau n'est sélectionné, sélectionner celui-ci
  if (!selectedDisk) {
    selectedDisk = clickedDisk;
    sourceTower = tower;
    clickedDisk.classList.add("selected");
  } else if (selectedDisk === clickedDisk) {
    // Si on clique sur le même anneau, le désélectionner
    deselectDisk();
  } else {
    // Si un autre anneau est sélectionné, essayer de déplacer
    tryMoveDisk(tower);
  }
}

// Fonction pour gérer le clic sur une tour
function handleTowerClick(event) {
  // Ne rien faire si on a cliqué sur un anneau (géré par handleDiskClick)
  if (event.target.classList.contains("disk")) {
    return;
  }

  const tower = event.currentTarget;

  // Si un anneau est sélectionné, essayer de le déplacer
  if (selectedDisk) {
    tryMoveDisk(tower);
  }
}

// Fonction pour essayer de déplacer un anneau
function tryMoveDisk(destinationTower) {
  const topDiskDestination = getTopDisk(destinationTower);
  const selectedSize = parseInt(selectedDisk.dataset.size);

  // Vérifier si le mouvement est valide
  let isValidMove = false;

  if (!topDiskDestination) {
    // La tour est vide, mouvement valide
    isValidMove = true;
  } else {
    const destinationSize = parseInt(topDiskDestination.dataset.size);
    // Mouvement valide si l'anneau sélectionné est plus petit
    isValidMove = selectedSize < destinationSize;
  }

  if (isValidMove) {
    // Déplacer l'anneau avec animation
    const disksContainer = destinationTower.querySelector(".disks");
    selectedDisk.classList.add("moving");
    disksContainer.appendChild(selectedDisk);
    selectedDisk.classList.remove("moving");

    // Incrémenter le compteur
    incrementMoveCount();

    deselectDisk();

    // Vérifier la victoire (seulement en mode manuel, pas pendant la démo)
    if (!isAnimating) {
      checkVictory();
    }
  } else {
    // Mouvement invalide, annuler la sélection
    deselectDisk();
  }
}

// Fonction pour désélectionner l'anneau
function deselectDisk() {
  if (selectedDisk) {
    selectedDisk.classList.remove("selected");
  }
  selectedDisk = null;
  sourceTower = null;
}

// Ajouter les écouteurs sur les tours
towers.forEach((tower) => {
  tower.addEventListener("click", handleTowerClick);
});

// ==================== DÉTECTION DE VICTOIRE ====================

// Fonction pour vérifier si le joueur a gagné
function checkVictory() {
  const disks3 = document.getElementById("disks3");
  const disksOnTower3 = disks3.querySelectorAll(".disk");

  // Victoire si tous les anneaux sont sur la tour 3
  if (disksOnTower3.length === currentDiskCount && currentDiskCount > 0) {
    showVictoryModal();
  }
}

// Fonction pour afficher le modal de victoire
function showVictoryModal() {
  const minMoves = calculateMinMoves(currentDiskCount);
  const efficiency = Math.round((minMoves / moveCount) * 100);

  let message = `Vous avez résolu le puzzle en <strong>${moveCount}</strong> coups !<br><br>`;
  message += `Nombre minimum de coups : <strong>${minMoves}</strong><br>`;
  message += `Votre efficacité : <strong>${efficiency}%</strong><br><br>`;

  if (moveCount === minMoves) {
    message += `🏆 <strong>PARFAIT !</strong> Vous avez atteint le score optimal ! 🏆`;
  } else if (efficiency >= 80) {
    message += `⭐ Excellent travail ! ⭐`;
  } else if (efficiency >= 50) {
    message += `👍 Bien joué ! Vous pouvez encore vous améliorer.`;
  } else {
    message += `💪 Continuez à vous entraîner !`;
  }

  victoryMessage.innerHTML = message;
  victoryModal.classList.remove("hidden");
}

// Fonction pour cacher le modal de victoire
function hideVictoryModal() {
  victoryModal.classList.add("hidden");
}

// Écouteur pour fermer le modal et rejouer
victoryCloseBtn.addEventListener("click", function () {
  hideVictoryModal();
  generateDisks(currentDiskCount);
});

// ==================== BOUTON RESET ====================

resetBtn.addEventListener("click", function () {
  if (isAnimating) {
    alert("Une démo est en cours. Veuillez attendre qu'elle se termine.");
    return;
  }

  if (currentDiskCount > 0) {
    generateDisks(currentDiskCount);
  } else {
    generateDisks(parseInt(diskCountInput.value));
  }
});

// ==================== MODE SOMBRE / CLAIR ====================

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("light-mode", !isDarkMode);
  themeToggle.textContent = isDarkMode ? "🌙" : "☀️";

  // Sauvegarder la préférence
  localStorage.setItem("hanoiTheme", isDarkMode ? "dark" : "light");
}

// Charger la préférence de thème
function loadThemePreference() {
  const savedTheme = localStorage.getItem("hanoiTheme");
  if (savedTheme === "light") {
    isDarkMode = false;
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.addEventListener("click", toggleTheme);
loadThemePreference();

// Écouteur d'événement sur le bouton Démarrer
startBtn.addEventListener("click", function () {
  // Ne pas permettre de redémarrer pendant une animation
  if (isAnimating) {
    alert("Une démo est en cours. Veuillez attendre qu'elle se termine.");
    return;
  }

  const diskCount = parseInt(diskCountInput.value);

  // Validation du nombre d'anneaux
  if (diskCount < 1 || diskCount > 8) {
    alert("Veuillez choisir un nombre d'anneaux entre 1 et 8");
    return;
  }

  // Générer les anneaux
  generateDisks(diskCount);

  console.log("Jeu démarré avec " + diskCount + " anneaux");
});

// ==================== ALGORITHME DE RÉSOLUTION AUTOMATIQUE ====================

// Fonction pour obtenir l'élément tour par son numéro (1, 2 ou 3)
function getTowerElement(towerNumber) {
  return document.getElementById("tower" + towerNumber);
}

// Fonction pour déplacer un anneau d'une tour à une autre (pour la démo)
function moveDisk(fromTower, toTower) {
  return new Promise((resolve) => {
    const sourceTowerEl = getTowerElement(fromTower);
    const destTowerEl = getTowerElement(toTower);

    const sourceDisks = sourceTowerEl.querySelector(".disks");
    const destDisks = destTowerEl.querySelector(".disks");

    // Récupérer l'anneau du dessus de la tour source
    const disks = sourceDisks.querySelectorAll(".disk");
    if (disks.length === 0) {
      resolve();
      return;
    }

    const diskToMove = disks[disks.length - 1];

    // Ajouter la classe selected pour l'animation
    diskToMove.classList.add("selected");

    // Attendre un peu pour montrer la sélection
    setTimeout(() => {
      // Ajouter la classe moving pour l'animation fluide
      diskToMove.classList.add("moving");

      // Déplacer l'anneau
      destDisks.appendChild(diskToMove);

      // Retirer les classes d'animation
      diskToMove.classList.remove("selected");
      diskToMove.classList.remove("moving");

      // Incrémenter le compteur
      incrementMoveCount();

      resolve();
    }, animationSpeed / 2);
  });
}

// Algorithme récursif classique des Tours de Hanoï
// n = nombre d'anneaux
// source = tour de départ (1, 2 ou 3)
// destination = tour d'arrivée (1, 2 ou 3)
// auxiliary = tour auxiliaire (1, 2 ou 3)
async function hanoi(n, source, destination, auxiliary) {
  if (n === 0) {
    return;
  }

  // Étape 1 : Déplacer n-1 anneaux de source vers auxiliaire
  await hanoi(n - 1, source, auxiliary, destination);

  // Étape 2 : Déplacer l'anneau restant de source vers destination
  await moveDisk(source, destination);
  await sleep(animationSpeed / 2);

  // Étape 3 : Déplacer n-1 anneaux d'auxiliaire vers destination
  await hanoi(n - 1, auxiliary, destination, source);
}

// Fonction utilitaire pour attendre
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction pour lancer la démo automatique
async function startDemo() {
  if (isAnimating) {
    alert("Une démo est déjà en cours.");
    return;
  }

  const diskCount = parseInt(diskCountInput.value);

  // Validation du nombre d'anneaux
  if (diskCount < 1 || diskCount > 8) {
    alert("Veuillez choisir un nombre d'anneaux entre 1 et 8");
    return;
  }

  // Réinitialiser le jeu
  generateDisks(diskCount);

  // Désactiver les interactions pendant la démo
  isAnimating = true;
  demoBtn.disabled = true;
  startBtn.disabled = true;
  resetBtn.disabled = true;
  demoBtn.textContent = "Démo en cours...";

  // Attendre un peu avant de commencer
  await sleep(500);

  // Lancer l'algorithme récursif
  // Déplacer tous les anneaux de la tour 1 vers la tour 3
  await hanoi(diskCount, 1, 3, 2);

  // Réactiver les interactions
  isAnimating = false;
  demoBtn.disabled = false;
  startBtn.disabled = false;
  resetBtn.disabled = false;
  demoBtn.textContent = "Démo automatique";

  // Afficher le message de fin (version démo)
  showDemoCompletionMessage(diskCount);
}

// Fonction pour afficher le message de fin de la démo
function showDemoCompletionMessage(diskCount) {
  const moves = calculateMinMoves(diskCount);

  let message = `La démo a résolu le puzzle en <strong>${moves}</strong> coups (optimal).<br><br>`;
  message += `Formule : 2<sup>n</sup> - 1 = 2<sup>${diskCount}</sup> - 1 = <strong>${moves}</strong><br><br>`;
  message += `🤖 C'est maintenant à votre tour !`;

  victoryMessage.innerHTML = message;
  victoryModal.classList.remove("hidden");
}

// Écouteur d'événement sur le bouton Démo
demoBtn.addEventListener("click", startDemo);
