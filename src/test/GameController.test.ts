import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { GameController } from '../game/GameController.ts';
import { Player } from '../game/Player.ts';

describe('GameController Class', () => {
	let game: GameController;

	beforeEach(() => {
		game = new GameController();
	});

	// Vérifie que l'application de la difficulté modifie bien les paramètres de spawn
	it('should update spawn interval based on difficulty', () => {
		game.difficulty = 'bredhell';
		game.applyDifficulty();
		const fastSpawn = game['currentSpawnInterval'];

		game.difficulty = 'entrainement';
		game.applyDifficulty();
		const slowSpawn = game['currentSpawnInterval'];

		assert.ok(fastSpawn < slowSpawn);
	});

	// Vérifie qu'un ennemi est ajouté à la liste après que le timer de spawn est dépassé
	it('should spawn an enemy when spawn timer reaches interval', () => {
		game.applyDifficulty();
		// On force le timer juste au dessus de l'intervalle
		game.update(game['currentSpawnInterval'] + 0.1);
		assert.strictEqual(game.enemies.length, 1);
	});

	// Vérifie qu'une collision entre un tir et un ennemi tue l'ennemi et augmente le score
	it('should handle collision between shot and enemy', () => {
		const player = new Player('p1');
		game.players.push(player);

		game.update(game['currentSpawnInterval'] + 0.1); // Spawn un ennemi
		const enemy = game.enemies[0];

		// On place un tir manuellement sur l'ennemi
		game.handleShoot('p1');
		const shot = game.shots[0];
		shot.position.x = enemy.position.x;
		shot.position.y = enemy.position.y;

		game['checkCollisions']();
		assert.strictEqual(enemy.pv, 0);
		assert.ok(player.score > 0);
	});

	// Vérifie que le jeu passe en pause quand tous les joueurs n'ont plus de PV
	it('should pause the game when all players are dead', () => {
		const player = new Player('p1');
		player.pv = 0;
		game.players.push(player);

		game.update(0.1);
		assert.strictEqual(game.isPause, true);
	});

	// Vérifie que le nettoyage supprime bien les entités inactives ou hors écran
	it('should cleanup inactive shots and dead enemies', () => {
		game.update(game['currentSpawnInterval'] + 0.1);
		game.enemies[0].pv = 0; // On tue l'ennemi

		game['cleanup']();
		assert.strictEqual(game.enemies.length, 0);
	});
});
