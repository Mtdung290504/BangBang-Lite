import {
	PLAYER_NAME_SESSION_STORAGE_KEY,
	ROOM_SEARCH_PARAM_KEY,
	SANDBOX_MAP_PARAM_KEY,
	SANDBOX_PLAYER_NAME,
	SANDBOX_PLAYER_NAME_PARAM_KEY,
	SANDBOX_TANK_PARAM_KEY,
} from './configs/constants/game-system-configs.js';

const URLsearchParams = new URLSearchParams(location.search);
const getSearchParam = (key = '') => URLsearchParams.get(key)?.trim();

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

async function init() {
	const ROOM_ID = getSearchParam(ROOM_SEARCH_PARAM_KEY);
	await document.fonts.ready;

	// Có room ID, khởi tạo chế độ chơi
	if (ROOM_ID) {
		console.log('> [AppGateway] Init play mode, room ID:', ROOM_ID);

		const role = await detectRole();
		let playerName = getStoredPlayerName();
		if (!playerName) {
			playerName = formatName(prompt('Nhập tên:') || '_');
			savePlayerName(playerName);
		}

		if (ROOM_ID && playerName.trim()) {
			console.log('> [AppGateway] Init play mode, role:', role);
			(await import('./src/initializer/index/app.js')).init(ROOM_ID, playerName, role);
		} else {
			alert('Thông tin không hợp lệ');
			location.href = '/';
		}

		return;
	}

	// Không có room ID, vào sandbox mode
	console.log('> [AppGateway] Init sandbox mode');

	const playerName = formatName(getSearchParam(SANDBOX_PLAYER_NAME_PARAM_KEY) || SANDBOX_PLAYER_NAME);
	const usingTankID = getSearchParam(SANDBOX_TANK_PARAM_KEY);
	const playingMapID = getSearchParam(SANDBOX_MAP_PARAM_KEY);

	const initializer = await import('./src/initializer/index/sandbox.js');
	initializer.init(playerName, usingTankID, playingMapID);
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

/**
 * Lấy tên user từ session storage
 */
function getStoredPlayerName() {
	const playerName = sessionStorage.getItem(PLAYER_NAME_SESSION_STORAGE_KEY);
	if (playerName) return playerName;
}

/**
 * Lưu tên player vào session storage
 * @param {string} playerName
 */
function savePlayerName(playerName) {
	sessionStorage.setItem(PLAYER_NAME_SESSION_STORAGE_KEY, playerName);
}

/**
 * Rút gọn tên tối đa 12 ký tự, nếu dài hơn sẽ thêm "..."
 *
 * @param {string} name
 * @param {number} [limit=14] - giới hạn ký tự
 */
function formatName(name, limit = 14) {
	if (typeof name !== 'string') return '';
	return name.length > limit ? name.slice(0, limit - 3) + '...' : name;
}
