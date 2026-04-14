const background = document.querySelector<HTMLDivElement>('.backlong');

export function startBackground() {
	if (background) {
		// On s'assure que l'animation est bien présente
		if (!background.style.animation) {
			background.style.animation = 'moveBackground 10s linear infinite';
		}
		background.style.animationPlayState = 'running';
	}
}

export function stopBackground() {
	if (background) {
		background.style.animationPlayState = 'paused';
	}
}
