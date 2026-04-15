import { Views } from '../common/types.ts';
import type { GameLoop } from '../game/GameLoop.ts';
import type { ScoreData } from '../game/ScoreManager.ts';
import { canvas } from './client.ts';
let activeView: any = Views.Connection;

export function getCurrentView(): any {
	return activeView;
}

export function displayView(viewClass: string): void {
	activeView = viewClass;

	// hide chaque view
	const allViews = document.querySelectorAll<HTMLDivElement>('body > div');
	allViews.forEach(div => div.classList.add('hide'));

	// affiche la target view
	const targetView = document.querySelector<HTMLDivElement>(`.${viewClass}`);
	if (targetView) {
		targetView.classList.remove('hide');
	}
}

export function initNavigationListeners(gameLoop: GameLoop): void {
	setupConnectionView(gameLoop);
	setupGameView(gameLoop);
	setupPauseView(gameLoop);
	setupParametersView();
	setupEndGameView(gameLoop);
	setupClassementView(gameLoop);
	setupCreditsView();
}

function setupConnectionView(gameLoop: GameLoop): void {
	const btnSolo = document.querySelector<HTMLButtonElement>('.solobutton')!;
	const inputPseudo = document.querySelector<HTMLInputElement>('.inputpseudo')!;
	const difficultySelector = document.querySelector<HTMLSelectElement>(
		'.difficulty-selector'
	)!;

	//choose player
	const btnPreced = document.querySelector<HTMLButtonElement>('.choosePreced')!;
	const btnNext = document.querySelector<HTMLButtonElement>('.chooseNext')!;

	let currentPlayerId = 1;

	function showPlayer(id: number) {
		for (let i = 1; i <= 4; i++) {
			const img = document.getElementById(`player${i}`) as HTMLImageElement;
			img.classList.toggle('visible', i === id);
			img.classList.toggle('hidden', i !== id);
		}
		currentPlayerId = id;
	}

	// Précédent / Suivant
	btnPreced.addEventListener('click', () =>
		showPlayer(currentPlayerId === 1 ? 4 : currentPlayerId - 1)
	);
	btnNext.addEventListener('click', () =>
		showPlayer(currentPlayerId === 4 ? 1 : currentPlayerId + 1)
	);

	btnSolo.addEventListener('click', () => {
		const pseudo = inputPseudo.value.trim();
		if (!pseudo || pseudo === '') {
			alert('Veuillez entrez un pseudo');
			return;
		}
		const difficulty = difficultySelector.value || 'escarmouche';

		// Démarrer la partie directement en local
		gameLoop.startGame(pseudo, difficulty, currentPlayerId);
		gameLoop.resize(canvas.width, canvas.height);

		displayView(Views.Game);
	});

	document.querySelector('.statbutton')!.addEventListener('click', () => {
		const scores: ScoreData[] = gameLoop.scoreManager.getAll();
		const tableBody = document.querySelector('.leaderboard tbody')!;
		tableBody.innerHTML = '';
		scores.forEach(s => {
			const row = `
				<tr>
				<td>${s.joueur}</td>
				<td>${s.ennemis}</td>
				<td>${s.difficulty}</td>
				<td>${s.temps}</td>
				<td>${s.score}</td>
				</tr>`;
			tableBody.innerHTML += row;
		});
		displayView(Views.Classement);
	});

	document.querySelector('.credit-button')!.addEventListener('click', () => {
		displayView(Views.Credits);
	});
}

function setupGameView(gameLoop: GameLoop): void {
	document.querySelector('.pause-button')!.addEventListener('click', () => {
		gameLoop.game.isPause = !gameLoop.game.isPause;
	});

	window.addEventListener('keydown', e => {
		if (
			e.key === 'p' &&
			!document
				.querySelector<HTMLDivElement>('.game-view')!
				.classList.contains('hide')
		) {
			gameLoop.game.isPause = !gameLoop.game.isPause;
		} else if (
			e.key === 't' &&
			!document
				.querySelector<HTMLDivElement>('.game-view')!
				.classList.contains('hide')
		) {
			gameLoop.game.isPause = true;
			displayView(Views.Parameters);
		}
	});

	document.querySelector('.settings-button')!.addEventListener('click', () => {
		gameLoop.game.isPause = true;
		displayView(Views.Parameters);
	});
}

function setupPauseView(gameLoop: GameLoop): void {
	document.querySelector('.btn-reprendre')!.addEventListener('click', () => {
		gameLoop.game.isPause = !gameLoop.game.isPause;
	});

	document.querySelector('.icon-home')!.addEventListener('click', e => {
		e.preventDefault();
		if (confirm('Quitter la partie en cours ?')) {
			gameLoop.stop();
			displayView(Views.Connection);
		}
	});

	document.querySelector('.icon-param')!.addEventListener('click', e => {
		e.preventDefault();
		displayView(Views.Parameters);
	});
}

function setupParametersView(): void {
	document
		.querySelector('.parameters .quitter')!
		.addEventListener('click', () => {
			displayView(Views.Game);
		});
}

function setupEndGameView(gameLoop: GameLoop): void {
	document.querySelector('.btn-rejouer')!.addEventListener('click', () => {
		gameLoop.resetGame();
		displayView(Views.Game);
	});

	document.querySelector('.homePA')!.addEventListener('click', e => {
		e.preventDefault();
		gameLoop.stop();
		displayView(Views.Connection);
	});

	document.querySelector('.statPA')!.addEventListener('click', e => {
		e.preventDefault();
		const scores: ScoreData[] = gameLoop.scoreManager.getAll();
		const tableBody = document.querySelector('.leaderboard tbody')!;
		tableBody.innerHTML = '';
		scores.forEach(s => {
			const row = `
				<tr>
				<td>${s.joueur}</td>
				<td>${s.ennemis}</td>
				<td>${s.difficulty}</td>
				<td>${s.temps}</td>
				<td>${s.score}</td>
				</tr>`;
			tableBody.innerHTML += row;
		});
		displayView(Views.Classement);
	});
}

function setupClassementView(_gameLoop: GameLoop): void {
	document
		.querySelector('.classment-view .back-button')!
		.addEventListener('click', e => {
			e.preventDefault();
			displayView(Views.Connection);
		});
}

function setupCreditsView(): void {
	document
		.querySelector('.credit-view .btn-return')!
		.addEventListener('click', e => {
			e.preventDefault();
			displayView(Views.Connection);
		});

	const easterEggButton =
		document.querySelector<HTMLLinkElement>('.easterEggButton');
	if (easterEggButton) {
		easterEggButton.addEventListener('click', function (event) {
			event.preventDefault();
			alert('Merci à Victor pour le thème du jeu ;)');
		});
	}
}
