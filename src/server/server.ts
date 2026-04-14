import http from 'http';
import { performance } from 'perf_hooks';
import { Server as IOServer } from 'socket.io';
import { GAMEPLAY_CONFIG, SERVER_PORT } from '../common/gameStats.ts';
import type { AvailableGame } from '../common/types.ts';
import { GameController } from './GameController.ts';
import { ManagerScore } from './ManagerScore.ts';
import { Player } from './Player.ts';

const httpServer = http.createServer();
const io = new IOServer(httpServer, { cors: { origin: true } });
const games: Map<string, GameController> = new Map();
const managerScore = new ManagerScore();

function generateRoomId(): string {
	return Math.random().toString(36).substring(2, 8);
} //pour generer l'id d'une room

let lastTime = performance.now();

io.on('connection', socket => {
	let playerRoomId: string | null = null;

	//socket.onCreateGame
	socket.on(
		'createGame',
		(
			data: {
				pseudo: string;
				difficulty: string;
				imgsrc: number;
				coop: boolean;
			},
			callback
		) => {
			const roomId = generateRoomId();
			const game = new GameController();
			const player = new Player(socket.id);
			player.idImg = data.imgsrc;
			player.pseudo = data.pseudo;
			player.kills = 0;
			game.players.push(player);
			game.difficulty = data.difficulty;
			game.applyDifficulty();
			game.isPause = false;
			game.isCoop = data.coop;
			socket.join(roomId);

			games.set(roomId, game);
			playerRoomId = roomId;

			callback({ roomId, game });
			console.log(`Partie solo créée : ${roomId} (joueur: ${socket.id})`);
		}
	);

	//leave game
	socket.on('leaveGame', () => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) {
				// 1. Retirer le joueur de la liste des joueurs de la partie
				game.players = game.players.filter(p => p.id !== socket.id);

				// 2. Faire quitter la room physique au socket pour ne plus recevoir de 'gameState'
				socket.leave(playerRoomId);

				console.log(`Joueur ${socket.id} a quitté la partie ${playerRoomId}`);

				// 3. Si la partie est vide, on la supprime de la Map
				if (game.players.length === 0) {
					games.delete(playerRoomId);
					console.log(`Partie ${playerRoomId} supprimée (car vide)`);
				} else {
					// Optionnel : Informer les autres joueurs restants
					socket.to(playerRoomId).emit('playerLeft', { playerId: socket.id });
				}
			}

			// 4. Reset l'ID de room locale du socket pour qu'il soit "libre"
			playerRoomId = null;
		}
	});

	//socket.onJoinGame
	socket.on(
		'joinGame',
		(
			roomId: string,
			data: { pseudo: string; difficulty: string; idImg: number },
			callback
		) => {
			if (!games.has(roomId)) {
				callback({ error: 'Partie introuvable' });
				return;
			}

			const game = games.get(roomId)!;
			if (game.players.length >= 4) {
				callback({ error: 'Partie pleine' });
				return;
			}

			const player = new Player(socket.id);
			game.players.push(player);
			player.kills = 0;
			player.idImg = data.idImg;
			socket.join(roomId);
			playerRoomId = roomId;
			player.pseudo = data.pseudo;

			callback({ success: true });
			console.log(`Joueur ${socket.id} rejoint ${socket.id}`);

			socket.to(roomId).emit('playerJoined', { playerId: socket.id });
		}
	);

	//socket.onListGame
	socket.on('listGames', callback => {
		const availableGames: AvailableGame[] = Array.from(games.entries())
			.map(([roomId, game]) => ({
				roomId,
				playersCount: game.players.length,
				maxPlayers: 4,
				isCoop: game.isCoop,
			}))
			.filter(game => game.playersCount < 4)
			.filter(game => game.isCoop);

		callback(availableGames);
	});

	socket.on('input', (dir: { x: number; y: number }) => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			const player = game?.players.find(p => p.id === socket.id);
			if (player) {
				player.setDirection(dir.x, dir.y);
			}
		}
	});

	socket.on('shoot', () => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) game.handleShoot(socket.id);
		}
	});
	socket.on('mouseInput', (pos: { x: number; y: number }) => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			const player = game?.players.find(p => p.id === socket.id);
			if (player) player.setMousePosition(pos.x, pos.y);
		}
	});

	socket.on('requestPause', () => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) game.isPause = !game.isPause;
		}
	});

	socket.on('getLeaderboard', callback => {
		const topScores = managerScore.getAll();
		callback(topScores);
	});

	socket.on('resize', (canvas: { width: number; height: number }) => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) {
				game.canvaSize.width = canvas.width;
				game.canvaSize.heigth = canvas.height;
				game.players.forEach(p => {
					p.CANVAS_WIDTH = canvas.width;
					p.CANVAS_HEIGHT = canvas.height;
				});
			}
		}
	});

	socket.on('resetGame', () => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) {
				game.reset();
				io.emit('gameState', game.getState());
			}
		}
	});

	socket.on('disconnect', () => {
		if (playerRoomId) {
			const game = games.get(playerRoomId);
			if (game) {
				game.players = game.players.filter(p => p.id !== socket.id);
				if (game.players.length === 0) {
					games.delete(playerRoomId);
					console.log(`Partie ${playerRoomId} supprimée (vide)`);
				}
			}
		}
	});
});

const TICK_RATE = GAMEPLAY_CONFIG.TIKE_RATE;
const TICK_INTERVAL = 1000 / TICK_RATE;

function loop() {
	const now = performance.now();
	const dt = (now - lastTime) / 1000;
	lastTime = now;

	//update pour chaque games
	games.forEach((game, roomId) => {
		game.update(dt);

		const playersAlive = game.players.filter(p => p.pv > 0).length;

		if (
			game.players.length > 0 &&
			playersAlive === 0 &&
			!game.isGameOverSaved
		) {
			game.isGameOverSaved = true;
			game.players.forEach(player => {
				managerScore.add({
					joueur: player.pseudo,
					ennemis: player.kills,
					difficulty: game.difficulty,
					temps: Math.floor(game.totalTime),
					score: player.score,
				});
			});
			console.log(`Scores de la room ${roomId} sauvegardés`);
		}
		io.to(roomId).emit('gameState', game.getState());
	});

	setTimeout(loop, TICK_INTERVAL);
}
httpServer.listen(SERVER_PORT, () => {
	console.log(`Server running at http://localhost:${SERVER_PORT}/`);
	loop();
});
