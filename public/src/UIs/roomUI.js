import { createViewBinding } from '../../libs/view_binding/index.js';
import { storage } from '../network/assets_managers/index.js';

const { viewBinding } = createViewBinding({
	container: '.ui-wrapper = div',

	roomIDLabel: '#room-id = p',
	readyBtn: '#ready-btn = button',
	playerSlots: '.player-slot = div[]',

	modalMapGrid: '.modal-content .grid-3 = div',
	modalTankGrid: '.modal-content .grid-5 = div',

	mapImageContainer: '#current-map',
	tankImageContainer: '#current-tank = label',
});

/**
 * @type {{
 * 		mapClickEvent: undefined | AbortController
 * 		tankClickEvent: undefined | AbortController
 * }}
 */
const abortControllers = { mapClickEvent: undefined, tankClickEvent: undefined };
export const views = viewBinding.bind();

/**
 * Note: Nhận vào socket để request event đổi map/tank
 *
 * @param {string} roomID
 * @param {{ emit: (event: string, ...data: any[]) => void }} emitter
 */
export function setup(roomID, emitter) {
	const { mapIDs, tankIDs } = storage.assetIDs;

	setRoomIDView(roomID);
	setMapImageView(0);
	setTankImageView(0);

	// Event để đổi tank, map
	if (!abortControllers.mapClickEvent)
		abortControllers.mapClickEvent = renderMapModal(mapIDs, (mapID) => emitter.emit('request:change-map', mapID));
	if (!abortControllers.tankClickEvent)
		abortControllers.tankClickEvent = renderTankModal(tankIDs, (tankID) =>
			emitter.emit('request:change-tank', tankID)
		);
}

export function destroy() {
	views.container.remove();
	abortControllers.mapClickEvent?.abort();
	abortControllers.tankClickEvent?.abort();
}

/**
 * @param {string} roomID
 * @returns {void}
 */
export function setRoomIDView(roomID) {
	views.roomIDLabel.setAttribute('room-id', roomID);
}

/**
 * @param {number} mapID
 * @returns {void}
 */
export function setMapImageView(mapID) {
	const { mapImageContainer: imageContainer } = views;

	imageContainer.innerHTML = '';
	imageContainer.appendChild(storage.getMapIcon(mapID).cloneNode());
}

/**
 * @param {number} tankID
 * @returns {void}
 */
export function setTankImageView(tankID) {
	const { tankImageContainer: imageContainer } = views;
	imageContainer.innerHTML = '';
	imageContainer.appendChild(storage.getSprite(tankID, 0, 'body').sprite.cloneNode());
	imageContainer.appendChild(storage.getSprite(tankID, 0, 'head').sprite.cloneNode());
}

/**
 * @param {{ [playerID: string]: import('../../../models/Player.js').default }} players
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
					<div class="name" title="${name}">${name}</div>
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
	views.readyBtn.classList[readyState ? 'add' : 'remove']('cancel');
}

/**
 * Note: return abort controller for cleanup
 *
 * @param {number[]} mapIDs
 * @param {(mapID: number) => void} itemClickListener
 */
export function renderMapModal(mapIDs, itemClickListener) {
	const { modalMapGrid } = views;
	const controller = new AbortController();

	modalMapGrid.innerHTML = '';
	mapIDs.forEach((mapID) => {
		const itemRoot = Object.assign(document.createElement('label'), { className: 'grid-item' });

		// Note: clone node vì dùng trong nhiều chỗ
		itemRoot.appendChild(storage.getMapIcon(mapID).cloneNode());
		itemRoot.setAttribute('for', 'modal-map-toggle');
		itemRoot.addEventListener('click', () => itemClickListener(mapID), { signal: controller.signal });

		modalMapGrid.appendChild(itemRoot);
	});

	return controller;
}

/**
 * Note: return abort controller for cleanup
 *
 * @param {number[]} tankIDs
 * @param {(tankID: number) => void} itemClickListener
 */
export function renderTankModal(tankIDs, itemClickListener) {
	const { modalTankGrid } = views;
	const controller = new AbortController();

	modalTankGrid.innerHTML = '';
	tankIDs.forEach((tankID) => {
		const itemRoot = Object.assign(document.createElement('label'), { className: 'grid-item' });

		itemRoot.appendChild(storage.getSprite(tankID, 0, 'body').sprite.cloneNode());
		itemRoot.appendChild(storage.getSprite(tankID, 0, 'head').sprite.cloneNode());
		itemRoot.setAttribute('for', 'modal-tank-toggle');
		itemRoot.addEventListener('click', () => itemClickListener(tankID), { signal: controller.signal });

		modalTankGrid.appendChild(itemRoot);
	});

	return controller;
}
