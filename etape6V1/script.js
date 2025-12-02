/**
 * Tours de Hanoï - Jeu Complet
 * ============================
 * Un jeu interactif des Tours de Hanoï avec animations,
 * démo automatique et mode sombre/clair.
 */

// ==================== //
// État du Jeu          //
// ==================== //
const gameState = {
  towers: [[], [], []], // État des 3 tours (tableaux d'anneaux)
  diskCount: 3, // Nombre d'anneaux
  moveCount: 0, // Compteur de coups
  selectedDisk: null, // Anneau actuellement sélectionné
  selectedTower: null, // Tour de l'anneau sélectionné
  isAnimating: false, // Animation en cours
  isDemoRunning: false, // Démo automatique en cours
  demoMoves: [], // File des mouvements pour la démo
};

// ==================== //
// Éléments DOM         //
// ==================== //
const elements = {
  diskCountInput: document.getElementById("disk-count"),
  startBtn: document.getElementById("start-btn"),
  resetBtn: document.getElementById("reset-btn"),
  demoBtn: document.getElementById("demo-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  moveCountDisplay: document.getElementById("move-count"),
  optimalScoreDisplay: document.getElementById("optimal-score"),
  messageDisplay: document.getElementById("message"),
  towers: [
    document.getElementById("tower-0"),
    document.getElementById("tower-1"),
    document.getElementById("tower-2"),
  ],
  towerContainers: document.querySelectorAll(".tower"),
};

// ==================== //
// Initialisation       //
// ==================== //
function init() {
  loadTheme();
  setupEventListeners();
  startGame();
}

function setupEventListeners() {
  elements.startBtn.addEventListener("click", startGame);
  elements.resetBtn.addEventListener("click", resetGame);
  elements.demoBtn.addEventListener("click", startDemo);
  elements.themeToggle.addEventListener("click", toggleTheme);

  elements.towerContainers.forEach((tower, index) => {
    tower.addEventListener("click", () => handleTowerClick(index));
  });

  elements.diskCountInput.addEventListener("change", () => {
    let value = parseInt(elements.diskCountInput.value);
    if (value < 3) value = 3;
    if (value > 8) value = 8;
    elements.diskCountInput.value = value;
  });
}

// ==================== //
// Gestion du Jeu       //
// ==================== //
function startGame() {
  stopDemo();

  gameState.diskCount = parseInt(elements.diskCountInput.value);
  gameState.moveCount = 0;
  gameState.selectedDisk = null;
  gameState.selectedTower = null;
  gameState.isAnimating = false;

  // Réinitialiser les tours
  gameState.towers = [[], [], []];

  // Placer tous les anneaux sur la première tour (du plus grand au plus petit)
  for (let i = gameState.diskCount; i >= 1; i--) {
    gameState.towers[0].push(i);
  }

  updateDisplay();
  updateStats();
  hideMessage();
}

function resetGame() {
  startGame();
}

function handleTowerClick(towerIndex) {
  if (gameState.isAnimating || gameState.isDemoRunning) return;

  const tower = gameState.towers[towerIndex];

  if (gameState.selectedDisk === null) {
    // Sélectionner un anneau
    if (tower.length > 0) {
      gameState.selectedDisk = tower[tower.length - 1];
      gameState.selectedTower = towerIndex;
      updateDiskSelection();
    }
  } else {
    // Tenter de déplacer l'anneau
    if (towerIndex === gameState.selectedTower) {
      // Désélectionner si on clique sur la même tour
      deselectDisk();
    } else if (isValidMove(gameState.selectedTower, towerIndex)) {
      // Effectuer le déplacement
      moveDisk(gameState.selectedTower, towerIndex);
    } else {
      // Mouvement invalide - animation de refus
      shakeTower(towerIndex);
    }
  }
}

function isValidMove(fromTower, toTower) {
  const sourceTower = gameState.towers[fromTower];
  const destTower = gameState.towers[toTower];

  if (sourceTower.length === 0) return false;

  const diskToMove = sourceTower[sourceTower.length - 1];

  // Une tour vide accepte tout anneau
  if (destTower.length === 0) return true;

  // L'anneau doit être plus petit que celui du dessus
  const topDisk = destTower[destTower.length - 1];
  return diskToMove < topDisk;
}

async function moveDisk(fromTower, toTower, isDemo = false) {
  gameState.isAnimating = true;

  const disk = gameState.towers[fromTower].pop();
  gameState.towers[toTower].push(disk);

  if (!isDemo) {
    gameState.moveCount++;
    deselectDisk();
  }

  await animateMove(fromTower, toTower, disk);

  updateStats();
  checkVictory();

  gameState.isAnimating = false;
}

function deselectDisk() {
  gameState.selectedDisk = null;
  gameState.selectedTower = null;
  updateDiskSelection();
}

function updateDiskSelection() {
  document.querySelectorAll(".disk").forEach((disk) => {
    disk.classList.remove("selected");
  });

  document.querySelectorAll(".tower").forEach((tower) => {
    tower.classList.remove("selected");
  });

  if (gameState.selectedDisk !== null) {
    const towerEl = elements.towers[gameState.selectedTower];
    const diskEl = towerEl.querySelector(
      `.disk[data-size="${gameState.selectedDisk}"]`
    );
    if (diskEl) {
      diskEl.classList.add("selected");
    }
    elements.towerContainers[gameState.selectedTower].classList.add("selected");
  }
}

function shakeTower(towerIndex) {
  const tower = elements.towerContainers[towerIndex];
  tower.style.animation = "none";
  tower.offsetHeight; // Forcer le reflow
  tower.style.animation = "shake 0.3s ease";

  setTimeout(() => {
    tower.style.animation = "";
  }, 300);
}

// ==================== //
// Animations           //
// ==================== //
async function animateMove(fromTower, toTower, diskSize) {
  return new Promise((resolve) => {
    updateDisplay();

    const diskEl = elements.towers[toTower].querySelector(
      `.disk[data-size="${diskSize}"]`
    );
    if (diskEl) {
      diskEl.classList.add("moving");
      setTimeout(() => {
        diskEl.classList.remove("moving");
        resolve();
      }, 500);
    } else {
      resolve();
    }
  });
}

// ==================== //
// Affichage            //
// ==================== //
function updateDisplay() {
  // Mettre à jour chaque tour
  gameState.towers.forEach((tower, index) => {
    const towerEl = elements.towers[index];
    towerEl.innerHTML = "";

    tower.forEach((diskSize) => {
      const disk = document.createElement("div");
      disk.className = "disk";
      disk.dataset.size = diskSize;
      towerEl.appendChild(disk);
    });
  });
}

function updateStats() {
  elements.moveCountDisplay.textContent = gameState.moveCount;
  const optimalMoves = Math.pow(2, gameState.diskCount) - 1;
  elements.optimalScoreDisplay.textContent = optimalMoves;
}

function showMessage(text) {
  elements.messageDisplay.textContent = text;
  elements.messageDisplay.classList.remove("hidden");
}

function hideMessage() {
  elements.messageDisplay.classList.add("hidden");
}

// ==================== //
// Victoire             //
// ==================== //
function checkVictory() {
  // Victoire si tous les anneaux sont sur la dernière tour
  if (gameState.towers[2].length === gameState.diskCount) {
    const optimalMoves = Math.pow(2, gameState.diskCount) - 1;
    let message = `🎉 Félicitations ! Gagné en ${gameState.moveCount} coups !`;

    if (gameState.moveCount === optimalMoves) {
      message += " 🏆 Score parfait !";
    } else {
      message += ` (Optimal: ${optimalMoves})`;
    }

    showMessage(message);
    createConfetti();

    if (gameState.isDemoRunning) {
      stopDemo();
    }
  }
}

function createConfetti() {
  const colors = [
    "#f56565",
    "#ed8936",
    "#ecc94b",
    "#48bb78",
    "#4299e1",
    "#9f7aea",
    "#ed64a6",
  ];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      confetti.style.width = Math.random() * 10 + 5 + "px";
      confetti.style.height = confetti.style.width;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
}

// ==================== //
// Démo Automatique     //
// ==================== //
function startDemo() {
  if (gameState.isDemoRunning) {
    stopDemo();
    return;
  }

  // Réinitialiser le jeu pour la démo
  startGame();

  gameState.isDemoRunning = true;
  elements.demoBtn.textContent = "⏹️ Arrêter la démo";
  elements.demoBtn.classList.add("active");

  // Générer les mouvements avec l'algorithme récursif
  gameState.demoMoves = [];
  generateHanoiMoves(gameState.diskCount, 0, 2, 1);

  // Exécuter les mouvements
  executeDemoMoves();
}

function stopDemo() {
  gameState.isDemoRunning = false;
  gameState.demoMoves = [];
  elements.demoBtn.textContent = "🤖 Démo automatique";
  elements.demoBtn.classList.remove("active");
}

function generateHanoiMoves(n, source, destination, auxiliary) {
  if (n === 0) return;

  // Déplacer n-1 anneaux de source vers auxiliaire
  generateHanoiMoves(n - 1, source, auxiliary, destination);

  // Déplacer le plus grand anneau de source vers destination
  gameState.demoMoves.push({ from: source, to: destination });

  // Déplacer n-1 anneaux d'auxiliaire vers destination
  generateHanoiMoves(n - 1, auxiliary, destination, source);
}

async function executeDemoMoves() {
  for (const move of gameState.demoMoves) {
    if (!gameState.isDemoRunning) break;

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!gameState.isDemoRunning) break;

    await moveDisk(move.from, move.to, true);
    gameState.moveCount++;
    updateStats();
  }

  if (gameState.isDemoRunning) {
    checkVictory();
  }
}

// ==================== //
// Thème                //
// ==================== //
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("hanoi-theme", newTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("hanoi-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// ==================== //
// CSS pour le shake    //
// ==================== //
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// ==================== //
// Démarrage            //
// ==================== //
document.addEventListener("DOMContentLoaded", init);
