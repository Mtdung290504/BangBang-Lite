import {
	ROOM_SEARCH_PARAM_KEY,
	SANDBOX_MAP_PARAM_KEY,
	SANDBOX_TANK_PARAM_KEY,
} from './src/configs/constants/game-system-configs.js';

const URLsearchParams = new URLSearchParams(location.search);
const getSearchParam = (key = '') => URLsearchParams.get(key)?.trim();

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

async function init() {
	const ROOM_ID = getSearchParam(ROOM_SEARCH_PARAM_KEY);
	await document.fonts.ready;

	if (ROOM_ID) {
		const playerName = prompt('Nhập tên:') || 'Không nhập tên bị gay';
		console.log('> [AppGateway] Init play mode, room ID:', ROOM_ID);
		if (ROOM_ID && playerName.trim()) (await import('./src/initializer/app.js')).init(ROOM_ID, playerName);
		else location.href = '/';
	} else {
		console.log('> [AppGateway] Init sandbox mode');
		(await import('./src/initializer/sandbox.js')).init(
			getSearchParam(SANDBOX_TANK_PARAM_KEY),
			getSearchParam(SANDBOX_MAP_PARAM_KEY)
		);
	}
}
