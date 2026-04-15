import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Ennemy } from '../game/Ennemy.ts';
import type { Entity } from '../game/Entity.ts';

//Test que 2 entités l'une sur l'autre sont bien en collision
describe('collision ok, one above the other', () => {
	const badRabbit: Ennemy = new Ennemy({ x: 0, y: 0 });
	const veryBadRabbit: Ennemy = new Ennemy({ x: 0, y: 0 });
	it('should return true', () => {
		assert.strictEqual(badRabbit.isInCollisionWith(veryBadRabbit), true);
		assert.strictEqual(veryBadRabbit.isInCollisionWith(badRabbit), true);
	});
});

//Test que 2 entités  sont bien en collision quand elles se chevauchent légèrement
describe('collision ok, a part above the other', () => {
	const badRabbit: Ennemy = new Ennemy({ x: 0, y: 0 });
	const veryBadRabbit: Ennemy = new Ennemy({ x: 0, y: 0 });
	it('should return true', () => {
		badRabbit.position.x = 80;
		badRabbit.position.y = 80;
		assert.strictEqual(badRabbit.isInCollisionWith(veryBadRabbit), true);
		assert.strictEqual(veryBadRabbit.isInCollisionWith(badRabbit), true);
	});
});

//Test que 2 entités sont bien en collision si les bords se touchent
describe('collision ok, border in contact', () => {
	const badRabbit: Ennemy = new Ennemy({ x: 0, y: 0 });
	const veryBadRabbit: Ennemy = new Ennemy({ x: 10, y: 99 });
	it('should return true', () => {
		assert.strictEqual(badRabbit.isInCollisionWith(veryBadRabbit), true);
		assert.strictEqual(veryBadRabbit.isInCollisionWith(badRabbit), true);
	});
});

//Test que 2 entités ne son pas  en collision si elles ne se touchent pas
describe('collision ok, nothing in contact', () => {
	const badRabbit: Entity = new Ennemy({ x: 0, y: 0 });
	const veryBadRabbit: Entity = new Ennemy({ x: 0, y: 0 });
	it('should return false', () => {
		badRabbit.position.x = 250;
		assert.strictEqual(badRabbit.isInCollisionWith(veryBadRabbit), false);
		assert.strictEqual(veryBadRabbit.isInCollisionWith(badRabbit), false);
		badRabbit.position.x = 80;
		badRabbit.position.y = 151;
		assert.strictEqual(badRabbit.isInCollisionWith(veryBadRabbit), false);
		assert.strictEqual(veryBadRabbit.isInCollisionWith(badRabbit), false);
	});
});
