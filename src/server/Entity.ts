import type { Position } from '../common/types.ts';

export class Entity {
	position: Position;
	height: number;
	width: number;

	constructor(position: Position, heigth: number, width: number) {
		this.position = position;
		this.height = heigth;
		this.width = width;
	}

	/**
	 * Vérifie si deux entités se chevauchent (AABB Collision)
	 */
	isInCollisionWith(entity: Entity): boolean {
		// On vérifie si les rectangles ne se touchent PAS.
		// Si l'une de ces conditions est vraie, il n'y a PAS de collision.
		return (
			this.position.x < entity.position.x + entity.width &&
			this.position.x + this.width > entity.position.x &&
			this.position.y < entity.position.y + entity.height &&
			this.position.y + this.height > entity.position.y
		);
	}
}
