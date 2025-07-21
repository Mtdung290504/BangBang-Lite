import { createViewBinding } from '../../libs/view_binding/index.js';

const { viewBinding } = createViewBinding({
	roomIDLabel: '#room-id = p',
	readyBtn: '#ready-btn = button',
	playerSlots: '.player-slot = []',
});

export const roomView = viewBinding.bind();

/**
 * @param {string} roomID
 * @returns {void}
 */
export function renderRoomIDView(roomID) {
	roomView.roomIDLabel.setAttribute('room-id', roomID);
}

/**
 * @param {{
 * 		[playerID: string]: import('../../../models/Player.js').default
 * }} players
 * @param {string[]} readyPlayers
 * @returns {void}
 */
export function renderPlayersView(players, readyPlayers) {
	const teamViews = ['.team-0', '.team-1'].map((selector) => document.querySelectorAll(`${selector} .player-slot`));
	teamViews.forEach((views) => views.forEach((view) => (view.innerHTML = '')));

	// View index for render (0 is index of slot in `team1View`, 1 of `team2View`)
	let slotIndexes = { 0: 0, 1: 0 };

	for (const playerID in players) {
		if (Object.prototype.hasOwnProperty.call(players, playerID)) {
			const { team, name } = players[playerID];
			const slotIndex = slotIndexes[team];

			teamViews[team][slotIndex].innerHTML = /*html*/ `
				<div class="player-info-wrapper">
					<div class="avatar" data-id="2"></div>
					<div class="name">${name}</div>
				</div>
				<div class="status ${readyPlayers.includes(playerID) ? 'ready' : ''}"></div>
			`;

			// To next slot
			slotIndexes[team]++;
		}
	}
}

/**
 * @param {boolean} readyState
 * @returns {void}
 */
export function setReadyState(readyState) {
	console.log(`> [RoomUI.setReadyState]: Value::${readyState}`);
	roomView.readyBtn.classList[readyState ? 'add' : 'remove']('cancel');
}
