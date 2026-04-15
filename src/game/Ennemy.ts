import { Entity } from './Entity.ts';
import { GAMEPLAY_CONFIG, MONSTER_STATS } from '../common/gameStats.ts';
import type { Position } from '../common/types.ts';

export class Ennemy extends Entity {
	public pv: number;
	private waveTime: number;
	private speed: number;
	public shotCooldown: number;
	private speedWave: number;
	private amplitude: number;
	private phase: number;

	constructor(startPos: Position) {
		super(startPos, MONSTER_STATS.HEIGTH, MONSTER_STATS.WIDTH);
		this.pv = MONSTER_STATS.HEALTH;
		this.amplitude = MONSTER_STATS.AMPLITUDE_WAVE;
		this.speedWave = MONSTER_STATS.SPEED_WAVE;
		this.speed = MONSTER_STATS.SPEED;
		this.waveTime = 0;
		this.shotCooldown = 0;
		this.phase = Math.random() * Math.PI * 2;
	}

	update(dt: number) {
		this.position.x -= this.speed * dt;

		this.waveTime += dt * this.speedWave;
		this.position.y +=
			Math.sin(this.waveTime + this.phase) * this.amplitude * dt;

		const halfHeight = this.height / 2;
		this.position.y = Math.max(
			halfHeight,
			Math.min(GAMEPLAY_CONFIG.CANVAS_HEIGHT - halfHeight, this.position.y)
		);

		if (this.shotCooldown > 0) {
			this.shotCooldown -= dt;
		}
	}

	public setSpeed(value: number) {
		this.speed = value;
	}

	public setWaveStats(amplitude: number, speed: number): void {
		this.amplitude = amplitude;
		this.speedWave = speed;
	}

	public resetCooldown(delay: number): void {
		this.shotCooldown = delay;
	}

	public canShoot(): boolean {
		return this.shotCooldown <= 0;
	}
}
