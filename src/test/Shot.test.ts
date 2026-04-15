import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Shot } from '../game/Shot.ts';

describe('Shot Class', () => {
	// Vérifie que le projectile se déplace horizontalement vers la droite après avoir été tiré
	it('should move rightwards', () => {
		const shot = new Shot({ x: 10, y: 10 });
		shot.update(0.1, { width: 1250, heigth: 850 });
		assert.ok(shot.position.x > 10);
	});

	// S'assure que le projectile est désactivé une fois qu'il dépasse la limite de portée maximale
	it('should deactivate when exceeding range', () => {
		const shot = new Shot({ x: 1999, y: 10 });
		shot.update(1, { width: 1250, heigth: 850 });
		assert.strictEqual(shot.active, false);
	});
});
