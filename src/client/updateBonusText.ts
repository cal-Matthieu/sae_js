export function updateBonusText(textBonus: string) {
	const paragrapheBonus =
		document.querySelector<HTMLParagraphElement>('.bonusText');
	if (paragrapheBonus) {
		paragrapheBonus.innerHTML = 'BONUS EN COURS : ' + textBonus;
	}
}
