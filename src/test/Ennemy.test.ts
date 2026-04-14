import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Ennemy } from '../server/Ennemy.ts';

describe('Ennemy Class', () => {
	it('should move to the left automatically', () => {
		const ennemy = new Ennemy({ x: 100, y: 100 });
		const initialX = ennemy.position.x;
		ennemy.update(0.1);
		assert.ok(ennemy.position.x < initialX);
	});

	it('should apply vertical wave movement', () => {
		const ennemy = new Ennemy({ x: 100, y: 100 });
		const initialY = ennemy.position.y;
		ennemy.setWaveStats(50, 10);
		ennemy.update(0.1);
		assert.notStrictEqual(ennemy.position.y, initialY);
	});
});
