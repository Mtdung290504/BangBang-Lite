import {
	ROOM_SEARCH_PARAM_KEY,
	SANDBOX_MAP_PARAM_KEY,
	SANDBOX_TANK_PARAM_KEY,
} from './configs/constants/game-system-configs.js';

const URLsearchParams = new URLSearchParams(location.search);
const getSearchParam = (key = '') => URLsearchParams.get(key)?.trim();

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

async function init() {
	const ROOM_ID = getSearchParam(ROOM_SEARCH_PARAM_KEY);
	await document.fonts.ready;

	if (ROOM_ID) {
		console.log('> [AppGateway] Init play mode, room ID:', ROOM_ID);

		const role = await detectRole();
		const playerName = prompt('Nhập tên:') || 'Không nhập tên bị gay';

		if (ROOM_ID && playerName.trim()) {
			console.log('> [AppGateway] Init play mode, role:', role);
			(await import('./src/initializer/index/app.js')).init(ROOM_ID, playerName, role);
		} else location.href = '/';
	} else {
		console.log('> [AppGateway] Init sandbox mode');
		(await import('./src/initializer/index/sandbox.js')).init(
			getSearchParam(SANDBOX_TANK_PARAM_KEY),
			getSearchParam(SANDBOX_MAP_PARAM_KEY)
		);
	}
}

async function detectRole(timeout = 100) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		const res = await fetch('http://127.0.0.1:3000/ping/', { signal: controller.signal });
		clearTimeout(timer);
		return res.ok ? 'host' : 'client'; // Nếu status 200 thì role là host (chính là máy chạy server)
	} catch {
		clearTimeout(timer);
		return 'client'; // timeout hoặc lỗi kết nối -> role client
	}
}
