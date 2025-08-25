// Input
import BattleInputManager from '../core/managers/battle/mgr.BattleInput.js';

// Socket
import { BufferedEmitter } from '../network/helpers/net.BufferedEmitter.js';
import getConnectedSocket from '../network/socket/getConnectedSocket.js';

// Assets
import { mapIDs, tankIDs, preloadPhase1 } from '../network/preloader.js';
import { storage } from '../network/assets_managers/index.js';

// Room
import { roomHandlers } from '../network/socket/handlers/index.js';
import * as roomView from '../UIs/roomUI.js';

// Config & debugs
import { LOGIC_FPS } from '../core/managers/system/mgr.game-loop.js';
import __debugger from '../utils/debugger.js';
__debugger.listen();

const DEBUG_MODE = true;

/**
 * - Request join room
 * - Preload phase 1
 * - Khi tất cả trong room sẵn sàng:
 * 	- Preload phase 2
 * 	- Giải phóng room UI (Trong tương lai sẽ giữ lại nhưng trước mắt cho cook)
 * 	- Tải xong phase 2 emit lên server
 * 	- Khi nhận event all loaded thì khởi tạo game
 *
 * @param {string} roomID
 * @param {string} playerName
 *
 * @returns {Promise<void>}
 */
export async function init(roomID, playerName) {
	// Setup socket & join room
	const socket = await setupSocket(DEBUG_MODE);
	socket.emit('request:join-room', roomID, playerName);

	// Preload phase 1 for lobby
	const preloadPhase1Result = await preloadPhase1();
	const { sprites, mapAssets, mapManifests, tankManifests } = storage;
	if (!preloadPhase1Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	if (DEBUG_MODE) {
		__debugger.observe(sprites, { name: 'Sprite storage' });
		__debugger.observe(mapAssets, { name: 'Map assets' });
		__debugger.observe(mapManifests, { name: 'Map Manifests' });
		__debugger.observe(tankManifests, { name: 'Tank Manifests' });
	}

	const inputMgr = setupInputManager(new BufferedEmitter(socket, () => LOGIC_FPS), DEBUG_MODE);
	inputMgr.listen();

	__debugger.hideAll();

	setupRoomView(roomID, socket);
}

async function setupSocket(debug = false) {
	try {
		const socket = await getConnectedSocket();
		roomHandlers.setup(socket);

		if (debug) __debugger.observe(socket, { name: 'Socket' });

		return socket;
	} catch (error) {
		alert('Lỗi khi kết nối đến server, cần tải lại trang hoặc thử vào lại sau!');
		throw error;
	}
}

/**
 * Note: Nhận vào socket để request event đổi map/tank
 *
 * @param {string} roomID
 * @param {Awaited<ReturnType<typeof setupSocket>>} socket
 */
function setupRoomView(roomID, socket) {
	roomView.setRoomIDView(roomID);
	roomView.setMapImageView(0);
	roomView.setTankImageView(0);
	roomView.renderMapModal(mapIDs, (mapID) => socket.emit('request:change-map', mapID));
	roomView.renderTankModal(tankIDs, (tankID) => socket.emit('request:change-tank', tankID));
}

/**
 * @param {ConstructorParameters<typeof BattleInputManager>[0]} emitter
 * @param {boolean} debug
 */
function setupInputManager(emitter, debug = false) {
	const inputMgr = new BattleInputManager(emitter);
	if (debug) __debugger.observe(inputMgr, { name: 'Input manager' });
	return inputMgr;
}
