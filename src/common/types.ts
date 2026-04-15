import type { Bonus } from '../game/Bonus.ts';

export const Views = {
	Connection: 'connection-view',
	Game: 'game-view',
	Classement: 'classment-view',
	Pause: 'pause-view',
	Parameters: 'parameters',
	PlayAgain: 'view-play-again',
	Credits: 'credit-view',
} as const;

export interface Position {
	x: number;
	y: number;
}

export interface EntityState {
	id: number | string;
	pos: Position;
	width: number;
	height: number;
	type: 'player' | 'enemy' | 'shot' | 'enemyShot';
}

export interface PlayerState extends EntityState {
	pseudo: string;
	pv: number;
	score: number;
	kills: number;
	difficulty: string;
	idImg: number;
	bonus: Bonus;
}

export interface GameState {
	players: PlayerState[];
	enemies: EntityState[];
	shots: EntityState[];
	enemyShots: EntityState[];
	bonus: Bonus[];
	time: number;
	isPause: boolean;
}

export interface BonusEffect {
	description: string;
	pv: number;
	shootSpeed: number;
	xp: number;
	invincibility: boolean;
	changeSize: Size | undefined;
	shootPower: boolean;
	time: number | undefined;
}

export interface Size {
	height: number;
	width: number;
}

export type PlayerImg = {
	lien: string;
	carrot: string;
};

export type CanvaSize = {
	width: number;
	heigth: number;
};
