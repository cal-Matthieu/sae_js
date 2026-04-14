import { GAMEPLAY_CONFIG, PLAYER_CONFIG } from '../common/gameStats.ts';
import type { CanvaSize } from '../common/types.ts';
import type { Bonus } from './Bonus.ts';
import { Entity } from './Entity.ts';
export class Player extends Entity {
	public id: string;
	public pseudo: string;
	public kills: number;
	public pv: number;
	public score: number;
	public vx: number;
	public vy: number;
	public dirX: number;
	public dirY: number;
	public shotCooldown: number;
	public idImg: number;
	private SHOT_DELAY: number = GAMEPLAY_CONFIG.PLAYER_SHOT_DELAY;
	public CANVAS_WIDTH = 0;
	public CANVAS_HEIGHT = 0;
	private DEADZONE = GAMEPLAY_CONFIG.DEADZONE;
	private isUsingMouse: boolean = false;

	private bonus: Bonus | undefined;

	constructor(id: string) {
		super(
			{ x: 50, y: GAMEPLAY_CONFIG.PLAYER_SPAWN_Y },
			PLAYER_CONFIG.HEIGTH,
			PLAYER_CONFIG.WIDTH
		);
		this.id = id;
		this.pseudo = 'JOUEUR';
		this.idImg = 1;
		this.kills = 0;
		this.pv = PLAYER_CONFIG.NB_LIVES;
		this.score = 0;
		this.vx = 0;
		this.vy = 0;
		this.dirX = 0;
		this.dirY = 0;
		this.shotCooldown = 0;
	}

	public isImmun() {
		return this.bonus != undefined && this.bonus.getEffect().invincibility;
	}

	public canShoot(): boolean {
		return this.shotCooldown <= 0;
	}

	public resetCooldown(): void {
		this.shotCooldown = this.SHOT_DELAY;
	}

	setDirection(x: number, y: number) {
		this.dirX = x;
		this.dirY = y;
	}

	public getBonus() {
		if (this.bonus) return this.bonus;
	}
	public hasBetterShot() {
		return this.bonus != undefined && this.bonus.getEffect().shootPower;
	}

	public addBonus(newBonus: Bonus) {
		this.removeBonus();
		this.bonus = newBonus;
		console.log(this.bonus.getEffect().description);
		const effect = newBonus.getEffect();
		if (effect.pv != 0) {
			this.pv += newBonus.getEffect().pv;
			if (this.pv >= GAMEPLAY_CONFIG.PLAYER_MAX_LIVES) {
				this.pv = GAMEPLAY_CONFIG.PLAYER_MAX_LIVES;
			}
		}
		if (effect.shootSpeed != 0) this.SHOT_DELAY = effect.shootSpeed;
		if (effect.changeSize != undefined) {
			this.height = effect.changeSize.height;
			this.width = effect.changeSize.width;
		}
		this.score += newBonus.getEffect().xp;
		if (this.score < 0) {
			this.score = 0;
		}
	}

	public removeBonus() {
		this.bonus = undefined;
		this.height = PLAYER_CONFIG.HEIGTH;
		this.width = PLAYER_CONFIG.WIDTH;
		this.SHOT_DELAY = GAMEPLAY_CONFIG.PLAYER_SHOT_DELAY;
	}

	private mouseX: number | null = null; //obligé d'enregistrer les valeurs car
	private mouseY: number | null = null; //quand la souris ne bouge plus, elle n'envoie plus rien

	public setMousePosition(x: number, y: number) {
		this.mouseX = x;
		this.mouseY = y;
		this.isUsingMouse = true;
	}

	update(dt: number, canvaSize: CanvaSize) {
		if (this.isUsingMouse) {
			this.calculateMouseDirection();
		} else {
			this.applyPhysics(dt, canvaSize);
		}

		if (this.dirX !== 0) this.vx += this.dirX * PLAYER_CONFIG.ACCELERATION * dt;
		else this.vx -= this.vx * PLAYER_CONFIG.FRICTION * dt;

		if (this.dirY !== 0) this.vy += this.dirY * PLAYER_CONFIG.ACCELERATION * dt;
		else this.vy -= this.vy * PLAYER_CONFIG.FRICTION * dt;

		const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);

		if (this.shotCooldown > 0) {
			this.shotCooldown -= dt;
		}

		if (speed > PLAYER_CONFIG.SPEED) {
			const ratio = PLAYER_CONFIG.SPEED / speed;
			this.vx *= ratio;
			this.vy *= ratio;
		}
		if (this.bonus != undefined) {
			const effect = this.bonus.getEffect();
			if (effect.time != undefined) {
				effect.time -= dt;
				if (effect.time <= 0) {
					this.removeBonus();
				}
			}
		}

		this.position.x += this.vx * dt;
		this.position.y += this.vy * dt;

		this.handleCanvasCollisions(canvaSize);
		if (this.shotCooldown > 0) {
			this.shotCooldown -= dt;
		}
	}
	private handleCanvasCollisions(canvaSize: CanvaSize) {
		if (this.position.x < 0) {
			this.position.x = 0;
			this.vx = 0;
		}
		if (this.position.x + this.width > canvaSize.width) {
			console.log(canvaSize);
			console.log('Collision droite');
			this.position.x = canvaSize.width - this.width;
			this.vx = 0;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
			this.vy = 0;
		}
		if (this.position.y + this.height > canvaSize.heigth) {
			this.position.y = canvaSize.heigth - this.height;
			this.vy = 0;
		}
	}

	private calculateMouseDirection() {
		if (this.mouseX === null || this.mouseY === null) return;

		const centerX = this.position.x + this.width / 2;
		const centerY = this.position.y + this.height / 2;

		const dx = this.mouseX - centerX;
		const dy = this.mouseY - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < this.DEADZONE) {
			this.dirX = 0;
			this.dirY = 0;

			this.vx = 0;
			this.vy = 0;
		} else {
			const speed = Math.min(distance * 5, PLAYER_CONFIG.SPEED);
			this.vx = (dx / distance) * speed;
			this.vy = (dy / distance) * speed;

			this.dirX = 0;
			this.dirY = 0;
		}
	}
	private applyPhysics(dt: number, canvaSize: CanvaSize) {
		if (this.dirX !== 0) {
			this.vx += this.dirX * PLAYER_CONFIG.ACCELERATION * dt;
		} else {
			this.vx -= this.vx * PLAYER_CONFIG.FRICTION * dt;
			if (Math.abs(this.vx) < 0.1) this.vx = 0;
		}

		if (this.dirY !== 0) {
			this.vy += this.dirY * PLAYER_CONFIG.ACCELERATION * dt;
		} else {
			this.vy -= this.vy * PLAYER_CONFIG.FRICTION * dt;
			if (Math.abs(this.vy) < 0.1) this.vy = 0;
		}
		const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
		if (speed > PLAYER_CONFIG.SPEED) {
			const ratio = PLAYER_CONFIG.SPEED / speed;
			this.vx *= ratio;
			this.vy *= ratio;
		}
		if (this.position.y < 0) this.position.y = 0;
		if (this.position.y + this.height > canvaSize.heigth) {
			this.position.y = canvaSize.heigth - this.height;
		}
	}
}
