import { BONUS_STATS } from '../common/gameStats.ts';
import type { BonusEffect, Position } from '../common/types.ts';
import { Entity } from './Entity.ts';

function randomInt(max: number): number {
	return Math.floor(Math.random() * max);
}

export abstract class Bonus extends Entity {
	public effect: BonusEffect;
	private timeOnScreen: number;
	private speed: number;
	private active: boolean;
	private duration: number;
	private directionY: boolean;

	constructor(position: Position, effect: BonusEffect) {
		super(position, BONUS_STATS.HEIGTH, BONUS_STATS.WIDGTH);
		this.effect = effect;
		this.timeOnScreen = randomInt(10);
		this.speed = BONUS_STATS.SPEED;
		this.active = true;
		this.duration = randomInt(3) + 1;
		this.directionY = randomInt(100) > 50;
	}

	public getTimeOnScreen() {
		return this.timeOnScreen;
	}

	public getEffect() {
		return this.effect;
	}

	public getDescription() {
		return this.effect.description;
	}

	public isActive() {
		return this.active;
	}

	public desactive() {
		this.active = false;
	}

	update(num: number) {
		this.position.x -= this.speed * num;
		if (this.directionY) this.position.y += (this.speed / 5) * num;
		else this.position.y -= (this.speed / 5) * num;
		this.timeOnScreen -= num;
		this.duration -= num;

		if (this.duration <= 0) {
			this.duration = randomInt(2) + 1;
			this.directionY = randomInt(10) > 5;
		}

		if (this.position.x < 0 || this.position.x > 2000) {
			this.active = false;
		}
	}
}
