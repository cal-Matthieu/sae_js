import { io, Socket } from 'socket.io-client';
import type { GameState, PlayerState } from '../common/types.ts';
import { Views } from '../common/types.ts';
import { dammageRed } from './dammage.ts';
import { getPlayerImage, sprites } from './imagesLoader.ts';
import {
	displayView,
	getCurrentView,
	initNavigationListeners,
} from './navigation.ts';
import { updateBonusText } from './updateBonusText.ts';
import { updateLifeBar } from './updateLifeBar.ts';
import { updateScoreBar } from './updateScoreBar.ts';
import { updateTime } from './updateTime.ts';

const socket: Socket = io(`${window.location.hostname}:8080`);
export const canvas =
	document.querySelector<HTMLCanvasElement>('.game-canvas')!;
const ctx = canvas.getContext('2d')!;

let lastServerState: GameState;
let lastPv: number = -1;

//des l'init on envoit les données de taille au serveur
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log(`Initial canvas size: ${canvas.width}x${canvas.height}`);
socket.emit('resize', { width: canvas.width, height: canvas.height });

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	socket.emit('resize', { width: canvas.width, height: canvas.height });
	console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const inputClavier = document.querySelector<HTMLInputElement>('#clavier');
const inputSouris = document.querySelector<HTMLInputElement>('#souris');

let moveMode: 'clavier' | 'souris' = 'clavier';

function updateMoveSelection() {
	if (inputSouris?.checked) {
		moveMode = 'souris';
		console.log('Mode : Souris');
	} else {
		moveMode = 'clavier';
		console.log('Mode : Clavier');
	}
}

inputClavier?.addEventListener('change', updateMoveSelection);
inputSouris?.addEventListener('change', updateMoveSelection);

updateMoveSelection();

const keys = { up: 0, down: 0, left: 0, right: 0 };

window.addEventListener('keydown', e => updateKeys(e.key, 1));
window.addEventListener('keyup', e => updateKeys(e.key, 0));

function updateKeys(key: string, val: number) {
	if (key === 'z' || key === 'Z' || key === 'ArrowUp') keys.up = val;
	if (key === 's' || key === 'S' || key === 'ArrowDown') keys.down = val;
	if (key === 'q' || key === 'Q' || key === 'ArrowLeft') keys.left = val;
	if (key === 'd' || key === 'D' || key === 'ArrowRight') keys.right = val;

	if (key === ' ') socket.emit('shoot');

	if (moveMode === 'clavier') {
		socket.emit('input', { x: keys.right - keys.left, y: keys.down - keys.up });
	}
}

window.addEventListener('mousemove', (e: MouseEvent) => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	if (moveMode === 'souris') {
		socket.emit('mouseInput', {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		});
	}
});

socket.on('gameState', (state: GameState) => {
	lastServerState = state;
	const currentView = getCurrentView();

	const me = state.players.find((p: any) => p.id === socket.id);
	updateTime(state);

	if (me) {
		updateLifeBar(me.pv);
		updateScoreBar(me.score);

		if (state.isPause) {
			displayPause(me, state);
		}

		if (lastPv > -1 && me.pv < lastPv) {
			dammageRed();
		}
		lastPv = me.pv;

		updatePlayAgainView(me, state);
	}

	const staticMenus = [
		Views.Parameters,
		Views.Classement,
		Views.Credits,
		Views.Connection,
		Views.ListGame,
	];
	if (staticMenus.includes(currentView)) return;

	if (state.isPause) {
		const playersAlive = state.players.filter(p => p.pv > 0).length;
		if (state.players.length > 0 && playersAlive === 0) {
			displayView(Views.PlayAgain);
		} else {
			displayView(Views.Pause);
		}
	} else {
		if (currentView === Views.Pause || currentView === Views.PlayAgain) {
			displayView(Views.Game);
		}
	}
});

function updatePlayAgainView(me: PlayerState, state: GameState) {
	const playAgainView = document.querySelector(`.${Views.PlayAgain}`);
	if (playAgainView && !playAgainView.classList.contains('hide')) {
		const imgPlayer = document.querySelector<HTMLImageElement>('.main-skin');
		const playerName = document.querySelector('.player-name');
		const finalScore = document.querySelector('.score-header h1');
		const finalKills = document.querySelector('.kills');
		const difficulty = document.querySelector('.difficulty');

		if (imgPlayer) {
			for (let i = 1; i <= 4; i++) {
				const img = document.getElementById(
					`player${i}end`
				) as HTMLImageElement;
				img.classList.toggle('visible', i === me.idImg);
				img.classList.toggle('hidden', i !== me.idImg);
			}
		}
		if (playerName) playerName.textContent = me.pseudo;
		if (finalScore) finalScore.textContent = `Score : ${me.score}`;
		if (finalKills) finalKills.textContent = `Ennemis abattus : ${me.kills}`;
		if (difficulty) difficulty.textContent = `Difficultés : ${me.difficulty}`;
		document.querySelector('.Time')!.textContent =
			`Temps en jeu : ${state.time}s`;
	}
}

function displayPause(me: PlayerState, state: GameState) {
	const pausePseudo = document.querySelector('.pause-pseudo');
	const pauseScore = document.querySelector('.pause-score-value');
	const pauseKills = document.querySelector('.pause-kill-value');
	const pauseTime = document.querySelector('.pause-time-value');
	const pausePv = document.querySelector('.pause-pv');

	if (pausePseudo) pausePseudo.textContent = me.pseudo;
	if (pausePv) pausePv.textContent = `Points de vies : ${me.pv.toString()}`;
	if (pauseScore) pauseScore.textContent = `Score : ${me.score.toString()} `;
	if (pauseKills) pauseKills.textContent = `Ennemis abattus : ${me.kills}`;
	if (pauseTime) pauseTime.textContent = `Temps : ${state.time.toString()}s`;
}

function render() {
	if (lastServerState) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Joueurs
		lastServerState.players.forEach(p => {
			if (p.pv > 0) {
				const img = getPlayerImage(p.idImg);
				console.log(p.idImg);
				if (img && img.complete) {
					const imageRatio = img.width / img.height;

					// 2. Définir la hauteur voulue (celle du serveur ou une constante)
					const targetHeight = p.height;

					// 3. Calculer la largeur correspondante pour garder le ratio
					const targetWidth = targetHeight * imageRatio;

					// 4. Dessiner (en centrant éventuellement si p.pos.x est le centre)
					ctx.drawImage(img, p.pos.x, p.pos.y, targetWidth, targetHeight);
				}
				var gradient = ctx.createLinearGradient(
					0,
					0,
					canvas.width,
					canvas.height
				);
				gradient.addColorStop(0, 'white');
				ctx.fillStyle = gradient;
				ctx.font = '20px Verdana';
				ctx.fillText(p.pseudo, p.pos.x + 45, p.pos.y - 10);
				if (p.bonus) {
					if (p.bonus.effect.invincibility) {
						//desiner une orbe autour du perso
						ctx.beginPath();
						ctx.arc(
							p.pos.x + p.width / 2,
							p.pos.y + p.height / 2,
							Math.max(p.width, p.height),
							0,
							2 * Math.PI
						);
						ctx.strokeStyle = 'yellow';
						ctx.lineWidth = 5;
						ctx.stroke();
						ctx.closePath();
					}
					updateBonusText(p.bonus.effect.description);
				} else {
					updateBonusText('');
				}
			}
		});

		// Ennemis
		lastServerState.enemies.forEach(e =>
			ctx.drawImage(sprites.ennemy, e.pos.x, e.pos.y, e.width, e.height)
		);

		// Tirs Joueurs
		lastServerState.shots.forEach(sh =>
			ctx.drawImage(sprites.shot, sh.pos.x, sh.pos.y, sh.width, sh.height)
		);

		// Tirs Ennemis
		lastServerState.enemyShots.forEach(es =>
			ctx.drawImage(sprites.ennemyShot, es.pos.x, es.pos.y, es.width, es.height)
		);

		// bonus
		lastServerState.bonus.forEach(b =>
			ctx.drawImage(
				sprites.bonus,
				b.position.x,
				b.position.y,
				b.width,
				b.height
			)
		);
	}
	requestAnimationFrame(render);
}

initNavigationListeners(socket);
displayView(Views.Connection);
requestAnimationFrame(render);
