import { SHOT_STATS } from '../common/gameStats.ts';
import type { CanvaSize, Position } from '../common/types.ts';
import { Entity } from './Entity.ts';
import type { Player } from './Player.ts';

export class Shot extends Entity {
	public active: boolean;
	public speed: number = SHOT_STATS.SPEED;
	public player: Player;

	constructor(startPos: Position, player?: Player) {
		super(startPos, SHOT_STATS.HEIGTH, SHOT_STATS.WIDTH);
		this.player = player!;
		this.active = true;
	}

	public isBetter() {
		return this.player.hasBetterShot();
	}

	update(dt: number, canvaSize: CanvaSize) {
		this.position.x += this.speed * dt;
		if (this.position.x < 0 || this.position.x > canvaSize.width) {
			this.active = false;
		}
	}
}
