// Script pour le jeu des Tours de Hanoï

// Récupération des éléments du DOM
const diskCountInput = document.getElementById("diskCount");
const startBtn = document.getElementById("startBtn");

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

// Fonction pour générer les anneaux sur la première tour
function generateDisks(count) {
  // Nettoyer toutes les tours
  const disks1 = document.getElementById("disks1");
  const disks2 = document.getElementById("disks2");
  const disks3 = document.getElementById("disks3");

  disks1.innerHTML = "";
  disks2.innerHTML = "";
  disks3.innerHTML = "";

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
}

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
