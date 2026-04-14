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
					html += "<img src='public/coeurjaune.png' alt='' />";
				} else {
					html += "<img src='public/coeur.png' alt='' />";
				}
			}
		}
		lifeBar.innerHTML = html;
	}
}
