import { randomInt } from 'node:crypto';
import { GAMEPLAY_CONFIG, PLAYER_CONFIG } from '../common/gameStats.ts';
import type { Position } from '../common/types.ts';
import { Bonus } from './Bonus.ts';

export class xpUp extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `+75 Points`,
			pv: 0,
			shootSpeed: 0,
			xp: 75,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: undefined,
		});
	}
}

export class bigXpUp extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: '+300 Points',
			pv: 0,
			shootSpeed: 0,
			xp: 300,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: randomInt(10) + 3,
		});
	}
}

export class xpDown extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: '-25 Points',
			pv: 0,
			shootSpeed: 0,
			xp: -25,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: randomInt(10) + 3,
		});
	}
}

export class BigXpdDown extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `-150 Points`,
			pv: 0,
			shootSpeed: 0,
			xp: -150,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: randomInt(10) + 3,
		});
	}
}

export class CriticalHeal extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `+1 Vie (-75 Points)`,
			pv: 1,
			shootSpeed: 0,
			xp: -75,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: randomInt(10) + 5,
		});
	}
}

export class Heal extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `+1 Vie`,
			pv: 1,
			shootSpeed: 0,
			xp: 0,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: undefined,
		});
	}
}

export class SuperHeal extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `+5 Vies`,
			pv: 5,
			shootSpeed: 0,
			xp: 0,
			invincibility: false,
			changeSize: undefined,
			shootPower: false,
			time: undefined,
		});
	}
}

export class Invincibility extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `Invincibilité (5-15s)`,
			pv: 0,
			shootSpeed: 0,
			xp: 0,
			invincibility: true,
			changeSize: undefined,
			shootPower: false,
			time: randomInt(10) + 5,
		});
	}
}

export class MyLittleVictor extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `Géant (3-13s)`,
			pv: 0,
			shootSpeed: 0,
			xp: 0,
			invincibility: false,
			changeSize: {
				height: PLAYER_CONFIG.HEIGTH * 3,
				width: PLAYER_CONFIG.WIDTH * 3,
			},
			shootPower: false,
			time: randomInt(10) + 3,
		});
	}
}

export class BabyVictor extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `Mini (3-13s)`,
			pv: 0,
			shootSpeed: 0,
			xp: 0,
			invincibility: false,
			changeSize: {
				height: PLAYER_CONFIG.HEIGTH / 2,
				width: PLAYER_CONFIG.WIDTH / 2,
			},
			shootPower: false,
			time: randomInt(10) + 3,
		});
	}
}

export class ShootThemAll extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `Tir Puissant (3-13s)`,
			pv: 0,
			shootSpeed: 0,
			xp: 0,
			invincibility: false,
			changeSize: undefined,
			shootPower: true,
			time: randomInt(10) + 3,
		});
	}
}

export class BredHellisNothing extends Bonus {
	constructor(position: Position) {
		super(position, {
			description: `ULTIMATE (30s)`,
			pv: 10,
			shootSpeed: GAMEPLAY_CONFIG.PLAYER_SHOT_DELAY / 2,
			xp: PLAYER_CONFIG.SPEED * 2,
			invincibility: true,
			changeSize: {
				height: PLAYER_CONFIG.HEIGTH * 3,
				width: PLAYER_CONFIG.WIDTH * 3,
			},
			shootPower: true,
			time: 30,
		});
	}
}
