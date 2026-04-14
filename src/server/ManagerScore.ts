import fs from 'fs'; // écriture de données dans un ficher JSON
export interface ScoreData {
	joueur: string;
	ennemis: number;
	difficulty: string;
	temps: number;
	score: number;
}

export class ManagerScore {
	private outputFilePath: string = './public/json/scores.json';

	constructor() {
		fs.writeFileSync(this.outputFilePath, '');
	}

	private lire(): ScoreData[] {
		try {
			if (!fs.existsSync(this.outputFilePath)) {
				return [];
			}
			const data = fs.readFileSync(this.outputFilePath, 'utf8');
			if (!data || data.trim() === '') {
				return [];
			}
			return JSON.parse(data); // transforme la chaine json en tableau
		} catch (error) {
			console.error('Erreur lecture scores :', error);
			return []; // fichier n'existe pas donc un tableau vide
		}
	}

	private ecrire(scores: ScoreData[]): void {
		try {
			fs.writeFileSync(this.outputFilePath, JSON.stringify(scores, null, 2));
		} catch (error) {
			console.error('Erreur écriture scores : ', error);
		}

		//writeFileSync : écriture dans un fichier, on peut encripter si besoin.
		//stringify : transforme une chaine de caractère en json
		//null : Une fonction qui modifie le comportement du processus de transformation
		//  2 :  insérer des espaces pas obligatoire
	}

	public create() {
		// créé le fichier s'il n'existe pas
		this.ecrire([]);
	}

	getAll() {
		// récupère tous les scores
		return this.lire();
	}

	add(score: ScoreData) {
		// ajoute un score
		const scores = this.lire();
		scores.push(score);
		scores.sort((a, b) => b.score - a.score);
		this.ecrire(scores.slice(0, 10)); // garde 10 meilleurs à mettre dans les stats si besoin
	}

	remove() {
		// supprime le plus petit score
		const scores = this.lire();
		if (scores.length > 0) {
			scores.sort((a, b) => b.score - a.score);
			scores.pop();
			this.ecrire(scores);
		}
	}
}

/** SOURCES
 *  écriture de données : [https://codesignal-com.translate.goog/learn/courses/hierarchical-and-structured-data-formats-in-ts/lessons/writing-json-files-using-typescript-and-nodejs?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=fr&_x_tr_pto=rq&_x_tr_hist=true](https://codesignal-com.translate.goog/learn/courses/hierarchical-and-structured-data-formats-in-ts/lessons/writing-json-files-using-typescript-and-nodejs?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=fr&_x_tr_pto=rq&_x_tr_hist=true)
 * [https://hupp.tech/fr/blog/typescript/travailler-avec-json-en-typescript-un-guide-complet/](https://hupp.tech/fr/blog/typescript/travailler-avec-json-en-typescript-un-guide-complet/)
 *
 * writeFileSync : https://www.geeksforgeeks.org/node-js/node-js-fs-writefilesync-method/
 *
 */
