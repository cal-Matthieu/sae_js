import type { Socket } from 'socket.io-client';
import { Views, type AvailableGame } from '../common/types.ts';
import type { ScoreData } from '../server/ManagerScore.ts';
import { canvas } from './client.ts';
import { updateListView } from './updateListView.ts';
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

export function initNavigationListeners(socket: Socket): void {
	setupConnectionView(socket);
	setupGameView(socket);
	setupPauseView(socket);
	setupParametersView();
	setupEndGameView(socket);
	setupClassementView(socket);
	setupCreditsView();
}

function setupConnectionView(socket: Socket): void {
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

		displayView('containerPopup');
		const ouiButton = document.querySelector<HTMLButtonElement>('.yesCoop');
		const nonButton = document.querySelector<HTMLButtonElement>('.noCoop');
		const createAndStartGame = (coop: boolean): void => {
			socket.emit(
				'createGame',
				{
					pseudo,
					difficulty,
					imgsrc: currentPlayerId,
					coop,
				},
				(response: any) => {
					if (response.roomId) {
						console.log(`Partie ${coop ? 'coop' : 'solo'} :`, response.roomId);
						document.body.dataset.roomId = response.roomId;
						socket.emit('resize', {
							width: canvas.width,
							height: canvas.height,
						});
					}
				}
			);

			displayView(Views.Game);
		};

		if (ouiButton && nonButton) {
			nonButton.addEventListener('click', event => {
				event.preventDefault();
				createAndStartGame(false);
			});

			ouiButton.addEventListener('click', () => createAndStartGame(true));
		}
	});

	document.querySelector('.statbutton')!.addEventListener('click', () => {
		socket.emit('getLeaderboard', (scores: ScoreData[]) => {
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
		});
		displayView(Views.Classement);
	});

	document.querySelector('.credit-button')!.addEventListener('click', () => {
		displayView(Views.Credits);
	});

	document.querySelector('.coopbutton')!.addEventListener('click', event => {
		event.preventDefault();
		console.log('COOP CLIC');
		socket.emit('listGames', (response: AvailableGame[]) => {
			(updateListView(response),
				displayView('listGame'),
				console.log(getCurrentView()));
		});
	});

	const ulList = document.querySelector('.ulList');
	if (ulList) {
		ulList.addEventListener('click', e => {
			// On cherche le bouton le plus proche du clic (au cas où on clique sur le h1 ou h2)
			const btn = (e.target as HTMLElement).closest('button');

			if (btn && btn.id) {
				const roomId = btn.id;
				const inputPseudo =
					document.querySelector<HTMLInputElement>('.inputpseudo')!;
				const pseudo = inputPseudo.value.trim();

				if (!pseudo) {
					alert('Choisis un pseudo avant de rejoindre !');
					return;
				}

				// On envoie la demande au serveur
				socket.emit(
					'joinGame',
					roomId,
					{ pseudo, idImg: currentPlayerId },
					(response: any) => {
						if (response.success) {
							console.log(`Joint la partie ${roomId} avec succès`);
							displayView(Views.Game); // On lance l'écran de jeu
						} else {
							alert(response.error || 'Impossible de rejoindre');
						}
					}
				);
			}
		});
	}

	const listGameToHome =
		document.querySelector<HTMLImageElement>('.listGameHomeImg')!;
	listGameToHome.addEventListener('click', function (event) {
		event.preventDefault();
		displayView(Views.Connection);
	});
}

function setupPopupCoopView(socket: Socket): void {}

function setupGameView(socket: Socket): void {
	document.querySelector('.pause-button')!.addEventListener('click', () => {
		socket.emit('requestPause');
	});

	window.addEventListener('keydown', e => {
		if (
			e.key === 'p' &&
			!document
				.querySelector<HTMLDivElement>('.game-view')!
				.classList.contains('hide')
		) {
			socket.emit('requestPause');
		} else if (
			e.key === 't' &&
			!document
				.querySelector<HTMLDivElement>('.game-view')!
				.classList.contains('hide')
		) {
			socket.emit('requestPause');
			displayView(Views.Parameters);
		}
	});

	document.querySelector('.settings-button')!.addEventListener('click', () => {
		socket.emit('requestPause');
		displayView(Views.Parameters);
	});
}

function setupPauseView(socket: Socket): void {
	document.querySelector('.btn-reprendre')!.addEventListener('click', () => {
		socket.emit('requestPause');
	});

	document.querySelector('.icon-home')!.addEventListener('click', e => {
		e.preventDefault();
		if (confirm('Quitter la partie en cours ?')) {
			socket.emit('leaveGame');
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

function setupEndGameView(socket: Socket): void {
	document.querySelector('.btn-rejouer')!.addEventListener('click', () => {
		socket.emit('resetGame');
		displayView(Views.Game);
	});

	document.querySelector('.homePA')!.addEventListener('click', e => {
		e.preventDefault();
		socket.emit('leaveGame');
		displayView(Views.Connection);
	});

	document.querySelector('.statPA')!.addEventListener('click', e => {
		e.preventDefault();
		socket.emit('getLeaderboard', (scores: ScoreData[]) => {
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
		});
		displayView(Views.Classement);
	});
}

function setupClassementView(socket: Socket): void {
	document
		.querySelector('.classment-view .back-button')!
		.addEventListener('click', e => {
			e.preventDefault();
			socket.emit('leaveGame');
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
