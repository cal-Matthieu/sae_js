import { GameController } from './GameController.ts';
import { Player } from './Player.ts';
import { ScoreManager } from './ScoreManager.ts';

export class GameLoop {
	public game: GameController;
	public scoreManager: ScoreManager;
	private lastTime: number = 0;
	private running: boolean = false;
	private onStateUpdate: ((state: ReturnType<GameController['getState']>) => void) | null = null;

	constructor() {
		this.game = new GameController();
		this.scoreManager = new ScoreManager();
	}

	/**
	 * Initialise et démarre une nouvelle partie
	 */
	public startGame(pseudo: string, difficulty: string, idImg: number): void {
		this.game = new GameController();
		const player = new Player('local-player');
		player.pseudo = pseudo;
		player.idImg = idImg;
		player.kills = 0;
		this.game.players.push(player);
		this.game.difficulty = difficulty;
		this.game.applyDifficulty();
		this.game.isPause = false;
		this.game.isGameOverSaved = false;

		// Appliquer la taille du canvas
		this.game.canvaSize = {
			width: window.innerWidth,
			height: window.innerHeight,
		} as any;

		this.running = true;
		this.lastTime = performance.now();
		requestAnimationFrame(this.tick.bind(this));
	}

	/**
	 * Enregistre un callback appelé à chaque frame avec le nouvel état du jeu
	 */
	public onUpdate(callback: (state: ReturnType<GameController['getState']>) => void): void {
		this.onStateUpdate = callback;
	}

	/**
	 * Met à jour la taille du canvas dans le jeu
	 */
	public resize(width: number, height: number): void {
		this.game.canvaSize.width = width;
		this.game.canvaSize.heigth = height;
		this.game.players.forEach(p => {
			p.CANVAS_WIDTH = width;
			p.CANVAS_HEIGHT = height;
		});
	}

	/**
	 * Obtient le joueur local
	 */
	public getPlayer(): Player | undefined {
		return this.game.players[0];
	}

	/**
	 * Boucle de jeu principale
	 */
	private tick(now: number): void {
		if (!this.running) return;

		const dt = (now - this.lastTime) / 1000;
		this.lastTime = now;

		// Limiter le dt pour éviter les sauts quand l'onglet perd le focus
		const clampedDt = Math.min(dt, 0.1);

		this.game.update(clampedDt);

		// Vérifier le game over et sauvegarder les scores
		const playersAlive = this.game.players.filter(p => p.pv > 0).length;
		if (
			this.game.players.length > 0 &&
			playersAlive === 0 &&
			!this.game.isGameOverSaved
		) {
			this.game.isGameOverSaved = true;
			this.game.players.forEach(player => {
				this.scoreManager.add({
					joueur: player.pseudo,
					ennemis: player.kills,
					difficulty: this.game.difficulty,
					temps: Math.floor(this.game.totalTime),
					score: player.score,
				});
			});
		}

		// Envoyer l'état au callback de rendu
		if (this.onStateUpdate) {
			this.onStateUpdate(this.game.getState());
		}

		requestAnimationFrame(this.tick.bind(this));
	}

	/**
	 * Arrête la boucle de jeu
	 */
	public stop(): void {
		this.running = false;
	}

	/**
	 * Reset la partie pour rejouer
	 */
	public resetGame(): void {
		this.game.reset();
	}
}
