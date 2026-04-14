export function dammageRed() {
	const div = document.querySelector<HTMLDivElement>('.redD');
	if (div) {
		div.classList.remove('hide');
		setTimeout(() => {
			div.classList.add('hide');
		}, 100);
	}
}
