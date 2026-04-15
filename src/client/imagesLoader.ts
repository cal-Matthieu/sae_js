const BASE = import.meta.env.BASE_URL;

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

// Préchargement — utilise BASE_URL de Vite pour que les chemins
// fonctionnent aussi bien en dev (/) qu'en production (/sae_js/)
sprites.ennemy.src = `${BASE}lapinzombie.png`;
sprites.player1.src = `${BASE}player/player1.png`;
sprites.player2.src = `${BASE}player/player2.png`;
sprites.player3.src = `${BASE}player/player3.png`;
sprites.player4.src = `${BASE}player/player4.png`;
sprites.shot.src = `${BASE}laser.png`;
sprites.ennemyShot.src = `${BASE}carotepourrie.png`;
sprites.bonus.src = `${BASE}steak.png`;


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
