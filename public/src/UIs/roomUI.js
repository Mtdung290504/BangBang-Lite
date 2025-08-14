import { createViewBinding } from '../../libs/view_binding/index.js';
import { PATHS } from '../configs/constants/paths.js';

const { viewBinding } = createViewBinding({
	roomIDLabel: '#room-id = p',
	readyBtn: '#ready-btn = button',
	playerSlots: '.player-slot = div[]',

	modalMapGrid: '.modal-content .grid-3 = div',
	modalTankGrid: '.modal-content .grid-5 = div',

	mapImage: '#current-map-image = img',
	tankBodyImage: '#current-tank-body = img',
	tankHeadImage: '#current-tank-head = img',
});

export const roomView = viewBinding.bind();

// Initialize UI:
setMapImageView(1);
setTankImageView(1);

/**
 * @param {string} roomID
 * @returns {void}
 */
export function setRoomIDView(roomID) {
	roomView.roomIDLabel.setAttribute('room-id', roomID);
}

/**
 * @param {number} mapID
 * @returns {void}
 */
export function setMapImageView(mapID) {
	roomView.mapImage.src = PATHS.map(mapID).iconPath;
}

/**
 * @param {number} tankID
 * @returns {void}
 */
export function setTankImageView(tankID) {
	roomView.tankBodyImage.src = PATHS.sprite(tankID, 'body').spritePath;
	roomView.tankHeadImage.src = PATHS.sprite(tankID, 'head').spritePath;
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
	let slotIndexes = [0, 0];

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

/**
 * @param {number[]} mapIDs
 * @param {(mapID: number) => void} itemClickListener
 */
export function renderMapModal(mapIDs, itemClickListener) {
	const { modalMapGrid } = roomView;
	modalMapGrid.innerHTML = '';

	mapIDs.forEach((mapID) => {
		const itemRoot = Object.assign(document.createElement('label'), {
			className: 'grid-item',
			innerHTML: /*html*/ `<img src="${PATHS.map(mapID).iconPath}">`,
		});

		itemRoot.setAttribute('for', 'modal-map-toggle');
		itemRoot.addEventListener('click', () => itemClickListener(mapID));
		modalMapGrid.appendChild(itemRoot);
	});
}

/**
 * @param {number[]} tankIDs
 * @param {(tankID: number) => void} itemClickListener
 */
export function renderTankModal(tankIDs, itemClickListener) {
	const { modalTankGrid } = roomView;
	modalTankGrid.innerHTML = '';

	tankIDs.forEach((tankID) => {
		const itemRoot = Object.assign(document.createElement('label'), {
			className: 'grid-item',
			innerHTML: /*html*/ `
				<img src="${PATHS.sprite(tankID, 'body').spritePath}">
				<img src="${PATHS.sprite(tankID, 'head').spritePath}">
			`,
		});

		itemRoot.setAttribute('for', 'modal-tank-toggle');
		itemRoot.addEventListener('click', () => itemClickListener(tankID));
		modalTankGrid.appendChild(itemRoot);
	});
}
