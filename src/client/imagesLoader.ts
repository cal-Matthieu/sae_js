export const sprites: Record<string, HTMLImageElement> = {
	ennemy: new Image(),
	player1: new Image(),
	player2: new Image(),
	player3: new Image(),
	player4: new Image(),
	shot: new Image(),
	ennemyShot: new Image(),
	bonus: new Image(),
};

// Préchargement
sprites.ennemy.src = '/lapinzombie.png';
sprites.player1.src = '/player/player1.png';
sprites.player2.src = '/player/player2.png';
sprites.player3.src = '/player/player3.png';
sprites.player4.src = '/player/player4.png';
sprites.shot.src = '/laser.png';
sprites.ennemyShot.src = '/carotepourrie.png';
sprites.bonus.src = '/steak.png';


// Tableau des joueurs déjà chargés pour le carrousel
export const playerImages: HTMLImageElement[] = [
	sprites.player1,
	sprites.player2,
	sprites.player3,
	sprites.player4,
];

// Retourne l'image déjà chargée par ID (1 à 4)
export function getPlayerImage(id: number): HTMLImageElement {
	if (id < 1 || id > 4) throw new Error(`Player ID invalide : ${id}`);
	return playerImages[id - 1];
}

