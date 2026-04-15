import {
	GAMEPLAY_CONFIG,
	MONSTER_STATS,
	PLAYER_CONFIG,
	SHOT_STATS,
} from '../common/gameStats.ts';
import type { CanvaSize, GameState } from '../common/types.ts';
import { Ennemy } from './Ennemy.ts';
import { Player } from './Player.ts';
import { Shot } from './Shot.ts';

import { Bonus } from './Bonus.ts';
import { GenerateBonus } from './BonusFactory.ts';

export class GameController {
	public difficulty: string;
	public players: Player[];
	public enemies: Ennemy[];
	public shots: Shot[];
	public enemyShots: Shot[];
	public bonus: Bonus[];
	public isPause: boolean;
	public isGameOverSaved: boolean;
	public canvaSize: CanvaSize;
	private spawnTimer: number;
	public totalTime: number = 0;
	public isCoop = false;
	private currentSpawnInterval: number;
	private currentEnemySpeed: number;
	private currentEnemyShotSpeed: number;
	private currentEnemyShotDelay: number;
	private currentScoreMultiplier: number;
	private currentWaveAmplitude: number = 30;
	private currentWaveSpeed: number = 2;

	constructor() {
		this.difficulty = 'entrainement';
		this.players = [];
		this.enemies = [];
		this.shots = [];
		this.enemyShots = [];
		this.isPause = false;
		this.isGameOverSaved = false;
		this.spawnTimer = 0;
		this.currentSpawnInterval = GAMEPLAY_CONFIG.ENEMY_SPAWN_INTERVAL;
		this.currentEnemySpeed = MONSTER_STATS.SPEED;
		this.currentEnemyShotSpeed = SHOT_STATS.SPEED;
		this.currentEnemyShotDelay = GAMEPLAY_CONFIG.ENEMY_SHOT_DELAY;
		this.currentScoreMultiplier = 1;
		this.bonus = [];
		this.canvaSize = { width: 1920, heigth: 1080 };
	}

	public update(dt: number): void {
		if (this.isPause) return;
		this.totalTime += dt;

		this.players.forEach(p => {
			if (p.pv > 0) p.update(dt, this.canvaSize);
		});
		this.enemies.forEach(e => e.update(dt));
		this.shots.forEach(s => s.update(dt, this.canvaSize));
		this.enemyShots.forEach(s => s.update(dt, this.canvaSize));
		this.bonus.forEach(s => s.update(dt));

		this.spawnTimer += dt;
		if (this.spawnTimer >= this.currentSpawnInterval) {
			this.spawnEnnemy();
			this.spawnTimer = 0;
		}

		this.checkCollisions();
		this.cleanup();

		const playersAlive = this.players.filter(p => p.pv > 0).length;

		// Si au moins un joueur était connecté et qu'ils sont tous morts
		if (this.players.length > 0 && playersAlive === 0) {
			this.isPause = true;
		}

		this.enemies.forEach(enemy => {
			if (enemy.canShoot()) {
				const shotPos = {
					x: enemy.position.x,
					y: enemy.position.y,
				};
				const enemyShot = new Shot(shotPos);
				enemyShot.speed = this.currentEnemyShotSpeed * -1;
				this.enemyShots.push(enemyShot);
				enemy.resetCooldown(this.currentEnemyShotDelay);
			}
		});
	}

	public applyDifficulty(): void {
		switch (this.difficulty) {
			case 'entrainement':
				this.currentSpawnInterval = GAMEPLAY_CONFIG.ENEMY_SPAWN_INTERVAL * 2;
				this.currentEnemySpeed = MONSTER_STATS.SPEED * 0.5;
				this.currentEnemyShotDelay = GAMEPLAY_CONFIG.ENEMY_SHOT_DELAY * 1.5;
				this.currentScoreMultiplier = PLAYER_CONFIG.SCORE_MULTIPLIER * 0.5;
				this.currentEnemyShotSpeed = SHOT_STATS.SPEED * 0.5;
				this.currentWaveAmplitude = MONSTER_STATS.AMPLITUDE_WAVE * 0.5;
				this.currentWaveSpeed = MONSTER_STATS.SPEED_WAVE * 0.5;
				break;
			case 'escarmouche':
				this.currentSpawnInterval = GAMEPLAY_CONFIG.ENEMY_SPAWN_INTERVAL * 1;
				this.currentEnemySpeed = MONSTER_STATS.SPEED * 1;
				this.currentEnemyShotDelay = GAMEPLAY_CONFIG.ENEMY_SHOT_DELAY * 1;
				this.currentScoreMultiplier = PLAYER_CONFIG.SCORE_MULTIPLIER * 1;
				this.currentEnemyShotSpeed = SHOT_STATS.SPEED * 1;
				this.currentWaveAmplitude = MONSTER_STATS.AMPLITUDE_WAVE * 1;
				this.currentWaveSpeed = MONSTER_STATS.SPEED_WAVE * 1;
				break;
			case 'assaut':
				this.currentSpawnInterval = GAMEPLAY_CONFIG.ENEMY_SPAWN_INTERVAL * 0.5;
				this.currentEnemySpeed = MONSTER_STATS.SPEED * 1.5;
				this.currentEnemyShotDelay = GAMEPLAY_CONFIG.ENEMY_SHOT_DELAY * 0.5;
				this.currentScoreMultiplier = PLAYER_CONFIG.SCORE_MULTIPLIER * 2;
				this.currentEnemyShotSpeed = SHOT_STATS.SPEED * 1.5;
				this.currentWaveAmplitude = MONSTER_STATS.AMPLITUDE_WAVE * 1.5;
				this.currentWaveSpeed = MONSTER_STATS.SPEED_WAVE * 2;
				break;
			case 'bredhell':
				this.currentSpawnInterval = GAMEPLAY_CONFIG.ENEMY_SPAWN_INTERVAL * 0.25;
				this.currentEnemySpeed = MONSTER_STATS.SPEED * 2;
				this.currentEnemyShotDelay = GAMEPLAY_CONFIG.ENEMY_SHOT_DELAY * 0.25;
				this.currentScoreMultiplier = PLAYER_CONFIG.SCORE_MULTIPLIER * 5;
				this.currentEnemyShotSpeed = SHOT_STATS.SPEED * 2;
				this.currentWaveAmplitude = MONSTER_STATS.AMPLITUDE_WAVE * 2;
				this.currentWaveSpeed = MONSTER_STATS.SPEED_WAVE * 4;
				break;
		}
	}

	public handleShoot(playerId: string): void {
		const player = this.players.find(p => p.id === playerId);

		// cooldown
		if (player && player.canShoot()) {
			const shotPos = {
				x:
					player.position.x +
					player.width * GAMEPLAY_CONFIG.PLAYER_SHOT_POSITION_X,
				y:
					player.position.y +
					player.height / GAMEPLAY_CONFIG.PLAYER_SHOT_POSITION_Y,
			};
			this.shots.push(new Shot(shotPos, player));
			player.resetCooldown();
		}
	}

	private spawnEnnemy(): void {
		const y = Math.random() * this.canvaSize.heigth;
		const enemy = new Ennemy({
			x: this.canvaSize.width - 50 + MONSTER_STATS.WIDTH,
			y,
		});

		enemy.setWaveStats(this.currentWaveAmplitude, this.currentWaveSpeed);
		enemy.setSpeed(this.currentEnemySpeed);

		this.enemies.push(enemy);
	}

	private checkCollisions(): void {
		this.enemies.forEach(e => {
			// Collision Tir -> Ennemi
			this.shots.forEach(s => {
				if (s.active && s.isInCollisionWith(e)) {
					if (Math.random() * 100 >= 80) {
						const b = GenerateBonus(e.position);
						this.bonus.push(b);
					}

					e.pv = 0;
					s.active = false;
					const player = s.player;
					if (player) {
						player.score += Math.floor(
							GAMEPLAY_CONFIG.ENEMY_SCORE_VALUE * this.currentScoreMultiplier
						);
						player.kills += 1;
					}
				}
			});

			// Collision Joueur -> Ennemi
			this.players.forEach(p => {
				if (e.pv > 0 && p.isInCollisionWith(e) && p.pv > 0) {
					e.pv = 0; // L'ennemi meurt
					p.pv -= 1; // Le joueur perd une vie
				}
			});
		});

		this.enemyShots.forEach(enemyShot => {
			// Tirs ennemis → Joueurs
			this.players.forEach(player => {
				if (player.pv > 0 && enemyShot.isInCollisionWith(player)) {
					if (!player.isImmun()) player.pv -= 1;
					enemyShot.active = false;
				}
			});

			this.shots.forEach(shot => {
				if (shot.isBetter() && enemyShot.isInCollisionWith(shot)) {
					shot.active = false;
					enemyShot.active = false;
				}
			});
		});
		// Collision Joueur -> Bonus
		this.players.forEach(p => {
			this.bonus.forEach(b => {
				if (p.isInCollisionWith(b)) {
					p.addBonus(b);
					b.desactive();
				}
			});
		});
	}

	private cleanup(): void {
		this.enemies = this.enemies.filter(
			e => e.pv > 0 && e.position.x > GAMEPLAY_CONFIG.ENEMY_CLEANUP_X
		);
		this.shots = this.shots.filter(
			s => s.active && s.position.x < this.canvaSize.width
		);
		this.enemyShots = this.enemyShots.filter(
			s => s.active && s.position.x > GAMEPLAY_CONFIG.ENEMY_CLEANUP_X
		);
		this.bonus = this.bonus.filter(
			b => b.isActive() && b.position.x > GAMEPLAY_CONFIG.ENEMY_CLEANUP_X
		);
	}

	getState(): GameState {
		return {
			players: this.players.map(p => ({
				id: p.id,
				pos: p.position,
				width: p.width,
				height: p.height,
				type: 'player',
				pseudo: p.pseudo,
				pv: p.pv,
				score: p.score,
				kills: p.kills || 0,
				difficulty: this.difficulty,
				idImg: p.idImg,
				bonus: p.getBonus() as Bonus,
			})),
			enemies: this.enemies.map((e, i) => ({
				id: i,
				pos: e.position,
				width: e.width,
				height: e.height,
				type: 'enemy',
			})),
			shots: this.shots.map((s, i) => ({
				id: i,
				pos: s.position,
				width: s.width,
				height: s.height,
				type: 'shot',
			})),
			enemyShots: this.enemyShots.map((s, i) => ({
				id: i,
				pos: s.position,
				width: s.width,
				height: s.height,
				type: 'enemyShot',
			})),
			bonus: this.bonus,
			time: Math.floor(this.totalTime),
			isPause: this.isPause,
		};
	}

	public reset(): void {
		this.enemies = [];
		this.shots = [];
		this.enemyShots = [];
		this.bonus = [];
		this.totalTime = 0;
		this.isPause = false;
		this.isGameOverSaved = false;
		this.spawnTimer = 0;

		this.applyDifficulty();

		this.players.forEach(p => {
			p.position = {
				x: GAMEPLAY_CONFIG.PLAYER_SPAWN_X,
				y: this.canvaSize.heigth / 2,
			};
			p.pv = GAMEPLAY_CONFIG.PLAYER_STARTING_LIVES;
			p.kills = 0;
			p.score = 0;
			p.kills = 0;
			p.vx = 0;
			p.vy = 0;
			p.removeBonus();
		});
	}
}
