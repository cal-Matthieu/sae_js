let lasteScore = -1;
export function updateScoreBar(score: number) {
	if (score === lasteScore) return;

	const scoreBar = document.querySelector<HTMLSpanElement>(
		'.score-container > span'
	);
	if (scoreBar) {
		lasteScore = score;

		scoreBar.innerHTML = '' + score;
	}
}
