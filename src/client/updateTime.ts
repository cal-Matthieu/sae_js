export function updateTime(state: any) {
	const timeElement = document.querySelector('.time-value')!;
	timeElement.textContent = state.time.toString();
}
