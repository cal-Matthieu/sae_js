const BASE = import.meta.env.BASE_URL;

let lastPvValue = -1;
export function updateLifeBar(pv: number) {
	if (pv === lastPvValue) return;

	const lifeBar = document.querySelector<HTMLUListElement>(
		'.health-container > ul'
	);
	if (lifeBar) {
		lastPvValue = pv;

		let html = '';
		if (pv > 0) {
			for (let i = 0; i < pv; i++) {
				if (i >= 3) {
					html += `<img src='${BASE}coeurjaune.png' alt='' />`;
				} else {
					html += `<img src='${BASE}coeur.png' alt='' />`;
				}
			}
		}
		lifeBar.innerHTML = html;
	}
}
