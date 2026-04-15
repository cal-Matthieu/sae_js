import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Player } from '../game/Player.ts';

describe('Player Class', () => {
	// Vérifie que le joueur se déplace en fonction de la vitesse et de l'accélération lorsqu'une direction est appliquée
	it('should update position based on direction and acceleration', () => {
		const player = new Player('p1');
		player.setDirection(1, 0);
		player.update(1, { width: 1250, heigth: 850 });
		assert.ok(player.position.x > 0);
	});

	// S'assure que le joueur ne peut pas sortir des limites définies du canvas
	it('should stay within canvas boundaries', () => {
		const player = new Player('p1');
		player.position.x = -100;
		player.update(0.1, { width: 1250, heigth: 850 });
		assert.strictEqual(player.position.x, 0);
	});

	// Valide la logique du temps de recharge (cooldown) empêchant le tir rapide tant que le temps n'est pas écoulé
	it('should handle shot cooldown correctly', () => {
		const player = new Player('p1');
		assert.strictEqual(player.canShoot(), true);

		player.resetCooldown();
		assert.strictEqual(player.canShoot(), false);

		player.update(10, { width: 1250, heigth: 850 }); // Simule le passage du temps
		assert.strictEqual(player.canShoot(), true);
	});
});
