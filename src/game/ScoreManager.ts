export interface ScoreData {
	joueur: string;
	ennemis: number;
	difficulty: string;
	temps: number;
	score: number;
}

const STORAGE_KEY = 'victor-scores';

export class ScoreManager {
	private lire(): ScoreData[] {
		try {
			const data = localStorage.getItem(STORAGE_KEY);
			if (!data || data.trim() === '') {
				return [];
			}
			return JSON.parse(data);
		} catch (error) {
			console.error('Erreur lecture scores :', error);
			return [];
		}
	}

	private ecrire(scores: ScoreData[]): void {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
		} catch (error) {
			console.error('Erreur écriture scores : ', error);
		}
	}

	getAll(): ScoreData[] {
		return this.lire();
	}

	add(score: ScoreData): void {
		const scores = this.lire();
		scores.push(score);
		scores.sort((a, b) => b.score - a.score);
		this.ecrire(scores.slice(0, 10)); // garde 10 meilleurs
	}
}
