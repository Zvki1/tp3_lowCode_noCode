(() => {
	"use strict";

	// Elements
	const ringInput = document.getElementById("ringCount");
	const startBtn = document.getElementById("startBtn");
	const resetBtn = document.getElementById("resetBtn");
	const demoBtn = document.getElementById("demoBtn");
	const moveCountEl = document.getElementById("moveCount");
	const optimalEl = document.getElementById("optimalMoves");
	const messageEl = document.getElementById("message");
	const towers = [0,1,2].map(i => document.getElementById(`tower-${i}`));
	const board = document.getElementById("board");
	const themeToggle = document.getElementById("themeToggle");
	const modeLabel = document.getElementById("modeLabel");

	// State
	let stacks = [[], [], []]; // arrays of ring sizes (1..n, where 1 is smallest)
	let n = 3;
	let moves = 0;
	let selectedFrom = null; // index of tower selected as source
	let runningDemo = false;
	let cancelDemo = false;

	// Utilities
	const optimalMovesFor = (k) => Math.pow(2, k) - 1;
	const setMessage = (txt = "", type = "") => {
		if (!txt) { messageEl.hidden = true; messageEl.textContent = ""; return; }
		messageEl.hidden = false; messageEl.textContent = txt;
		messageEl.style.color = type === "win" ? "var(--accent)" : type === "warn" ? "var(--warn)" : "inherit";
	};
	const updateCounters = () => {
		moveCountEl.textContent = moves.toString();
		optimalEl.textContent = optimalMovesFor(n).toString();
	};
	const topOf = (i) => stacks[i][stacks[i].length - 1];
	const canMove = (from, to) => {
		const a = topOf(from);
		const b = topOf(to);
		if (!a) return false;
		if (!b) return true;
		return a < b;
	};
	const clearSelectionStyles = () => {
		document.querySelectorAll('.tower').forEach(t => t.classList.remove('active','invalid'));
		document.querySelectorAll('.ring').forEach(r => r.classList.remove('selected'));
	};

	// Rendering
	const ringWidthPct = (size) => 30 + size * 8; // visual width percent
	const ringClassFor = (size) => `c${Math.min(size, 8)}`;
	const render = () => {
		towers.forEach((stackEl, i) => {
			stackEl.innerHTML = "";
			stacks[i].forEach((size) => {
				const div = document.createElement('div');
				div.className = `ring ${ringClassFor(size)} size-${size}`;
				div.style.width = `${ringWidthPct(size)}%`;
				div.dataset.size = String(size);
				div.setAttribute('role','button');
				div.setAttribute('aria-label',`Anneau ${size}`);
				stackEl.appendChild(div);
			});
		});
	};

	// FLIP animation helper: animate DOM move smoothly
	const animateMove = (el, toStackEl) => new Promise((resolve) => {
		const first = el.getBoundingClientRect();
		// Move in DOM
		toStackEl.appendChild(el);
		// Force layout
		const last = el.getBoundingClientRect();
		const dx = first.left - last.left;
		const dy = first.top - last.top;
		el.style.transform = `translate(${dx}px, ${dy}px)`;
		el.style.transition = 'transform 0s';
		requestAnimationFrame(() => {
			el.style.transition = 'transform .22s ease';
			el.style.transform = 'translate(0, 0)';
			const done = () => { el.removeEventListener('transitionend', done); resolve(); };
			el.addEventListener('transitionend', done, { once: true });
		});
	});

	const redrawStacks = () => { // preserve elements for smoother anims
		towers.forEach((stackEl, i) => {
			const current = Array.from(stackEl.children);
			const needed = stacks[i].map(s => ({ key: String(s), size: s }));
			// map existing
			const map = new Map();
			current.forEach(el => map.set(el.dataset.size, el));
			// ensure order bottom->top in DOM equals stacks[i] order
			const fragment = document.createDocumentFragment();
			needed.forEach((r) => {
				const el = map.get(r.key) ?? (() => {
					const d = document.createElement('div');
					d.className = `ring ${ringClassFor(r.size)} size-${r.size}`;
					d.style.width = `${ringWidthPct(r.size)}%`;
					d.dataset.size = String(r.size);
					d.setAttribute('role','button');
					d.setAttribute('aria-label',`Anneau ${r.size}`);
					return d;
				})();
				fragment.appendChild(el);
			});
			stackEl.innerHTML = "";
			stackEl.appendChild(fragment);
		});
	};

	const init = (count) => {
		n = Math.max(3, Math.min(8, Number(count) || 3));
		stacks = [[], [], []];
		for (let s = n; s >= 1; s--) stacks[0].push(s);
		moves = 0;
		selectedFrom = null;
		cancelDemo = true; runningDemo = false;
		updateCounters();
		setMessage("");
		redrawStacks();
		resetBtn.disabled = false;
	};

	const trySelectOrMove = (towerIndex) => {
		if (runningDemo) return;
		const tEls = Array.from(document.querySelectorAll('.tower'));

		if (selectedFrom === null) {
			if (!topOf(towerIndex)) { setMessage("Aucun anneau à déplacer ici", "warn"); return; }
			selectedFrom = towerIndex;
			clearSelectionStyles();
			tEls[selectedFrom]?.classList.add('active');
			const stackEl = towers[selectedFrom];
			const ringEl = stackEl.lastElementChild;
			ringEl?.classList.add('selected');
			setMessage("Choisissez une tour de destination …");
			return;
		}

		if (towerIndex === selectedFrom) {
			// cancel selection
			selectedFrom = null;
			clearSelectionStyles();
			setMessage("");
			return;
		}

		if (!canMove(selectedFrom, towerIndex)) {
			tEls[towerIndex]?.classList.add('invalid');
			setTimeout(() => tEls[towerIndex]?.classList.remove('invalid'), 250);
			setMessage("Déplacement invalide (anneau plus grand)", "warn");
			return;
		}

		// Perform move with animation
		const size = stacks[selectedFrom].pop();
		stacks[towerIndex].push(size);

		// Animate using the existing top ring element
		const fromEl = towers[selectedFrom];
		const toEl = towers[towerIndex];
		const ringEl = fromEl.lastElementChild; // it corresponds to size moved

		moves++;
		updateCounters();
		clearSelectionStyles();
		selectedFrom = null;
		setMessage("");

		animateMove(ringEl, toEl).then(() => {
			// After animation, ensure DOM order matches stacks (for next moves)
			redrawStacks();
			checkWin();
		});
	};

	const checkWin = () => {
		if (stacks[2].length === n || stacks[1].length === n) {
			setMessage(`Bravo ! Résolu en ${moves} coups (optimal: ${optimalMovesFor(n)})`, "win");
		}
	};

	// Demo (recursive) with visual timing
	const sleep = (ms) => new Promise(r => setTimeout(r, ms));
	async function moveOne(from, to) {
		if (cancelDemo) return;
		// Simulate click-based move with rules enforced
		const movable = canMove(from, to);
		if (!movable) throw new Error("Invalid move in solver");

		const size = stacks[from].pop();
		stacks[to].push(size);
		const fromEl = towers[from];
		const toEl = towers[to];
		const ringEl = fromEl.lastElementChild;
		moves++; updateCounters(); setMessage("");
		await animateMove(ringEl, toEl);
		redrawStacks();
		await sleep(140);
	}

	async function hanoi(k, from, aux, to) {
		if (cancelDemo) return;
		if (k === 1) {
			await moveOne(from, to);
		} else {
			await hanoi(k - 1, from, to, aux);
			await moveOne(from, to);
			await hanoi(k - 1, aux, from, to);
		}
	}

	async function runDemo() {
		if (runningDemo) { cancelDemo = true; return; }
		cancelDemo = false; runningDemo = true; setMessage("Démo en cours… Cliquez à nouveau pour arrêter.");
		startBtn.disabled = true; resetBtn.disabled = true; demoBtn.textContent = "Arrêter la démo";
		try {
			// Ensure a fresh puzzle from current ringInput
			init(ringInput.value);
			await sleep(300);
			await hanoi(n, 0, 1, 2);
			if (!cancelDemo) setMessage(`Démo terminée en ${moves} coups.`);
		} catch (e) {
			console.error(e);
		} finally {
			runningDemo = false; cancelDemo = false;
			startBtn.disabled = false; resetBtn.disabled = false; demoBtn.textContent = "Démo automatique";
			checkWin();
		}
	}

	// Theme toggle
	const applyTheme = (dark) => {
		document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
		modeLabel.textContent = dark ? 'Sombre' : 'Clair';
	};
	const storedTheme = localStorage.getItem('hanoi-theme');
	if (storedTheme) {
		const dark = storedTheme === 'dark';
		themeToggle.checked = dark; applyTheme(dark);
	} else {
		const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		themeToggle.checked = prefersDark; applyTheme(prefersDark);
	}
	themeToggle.addEventListener('change', () => {
		const dark = themeToggle.checked; applyTheme(dark);
		localStorage.setItem('hanoi-theme', dark ? 'dark' : 'light');
	});

	// Events
	document.querySelectorAll('.tower').forEach((t) => t.addEventListener('click', (e) => {
		const idx = Number(t.dataset.index);
		trySelectOrMove(idx);
	}));

	startBtn.addEventListener('click', () => { init(ringInput.value); });
	resetBtn.addEventListener('click', () => { init(n); });
	demoBtn.addEventListener('click', () => { runDemo(); });

	ringInput.addEventListener('change', () => {
		const v = Math.max(3, Math.min(8, Number(ringInput.value) || 3));
		ringInput.value = String(v);
		optimalEl.textContent = optimalMovesFor(v).toString();
	});

	// Initialize first view
	init(ringInput.value);
})();

