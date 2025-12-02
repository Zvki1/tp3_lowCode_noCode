// Script pour le jeu des Tours de Hanoï

// Récupération des éléments du DOM
const diskCountInput = document.getElementById("diskCount");
const startBtn = document.getElementById("startBtn");
const towers = document.querySelectorAll(".tower");

// Couleurs pour les anneaux
const diskColors = [
  "#FF6B6B", // Rouge
  "#4ECDC4", // Turquoise
  "#45B7D1", // Bleu clair
  "#96CEB4", // Vert menthe
  "#FFEAA7", // Jaune
  "#DDA0DD", // Violet clair
  "#98D8C8", // Vert eau
  "#F7DC6F", // Or
];

// Variable pour stocker l'anneau sélectionné
let selectedDisk = null;
let sourceTower = null;

// Fonction pour générer les anneaux sur la première tour
function generateDisks(count) {
  // Nettoyer toutes les tours
  const disks1 = document.getElementById("disks1");
  const disks2 = document.getElementById("disks2");
  const disks3 = document.getElementById("disks3");

  disks1.innerHTML = "";
  disks2.innerHTML = "";
  disks3.innerHTML = "";

  // Réinitialiser la sélection
  selectedDisk = null;
  sourceTower = null;

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
    disk.style.backgroundColor = diskColors[(i - 1) % diskColors.length];

    disks1.appendChild(disk);
  }

  // Ajouter les écouteurs de clic sur les anneaux
  addDiskListeners();
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
    // Déplacer l'anneau
    const disksContainer = destinationTower.querySelector(".disks");
    disksContainer.appendChild(selectedDisk);
    deselectDisk();
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

// Écouteur d'événement sur le bouton Démarrer
startBtn.addEventListener("click", function () {
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
