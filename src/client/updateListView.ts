import type { AvailableGame } from '../common/types.ts';

export function updateListView(list: AvailableGame[]) {
	const ul = document.querySelector('.ulList');
	if (ul) {
		let html: string = '';
		list.forEach(game => {
			html += `<button id="${game.roomId}" class="game-item-btn"> 
                <h1> ID : ${game.roomId}</h1>
                <h2> Joueurs en ligne : ${game.playersCount}</h2>
                <h2> Joueurs Maximum : ${game.maxPlayers}</h2>
            </button>`;
		});
		ul.innerHTML = html;
	}
}
