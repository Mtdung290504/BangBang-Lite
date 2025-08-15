import BattleInputManager from '../managers/battle/mgr.BattleInput.js';
import { preloadPhase1 } from '../network/preloader.js';
import getConnectedSocket from '../network/socket/getConnectedSocket.js';
import { roomHandlers } from '../network/socket/handlers/gateway.js';
import { renderMapModal, setRoomIDView, renderTankModal } from '../UIs/roomUI.js';
import __debugger from '../utils/debugger.js';
// __debugger.listen();

const DEBUG_MODE = true;

/**
 * @param {string} roomID
 * @param {string} playerName
 * @returns {Promise<void>}
 */
export async function init(roomID, playerName) {
	// Setup socket & join room
	const socket = await setupSocket(DEBUG_MODE);
	socket.emit('request:join-room', roomID, playerName);

	const preloadPhase1Result = await preloadPhase1();
	if (!preloadPhase1Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	const inputMgr = setupInputManager(DEBUG_MODE);
	inputMgr.listen();

	setRoomIDView(roomID);
	__debugger.hideAll();

	await renderRoomModal(socket);
}

async function setupSocket(debug = false) {
	try {
		const socket = await getConnectedSocket();
		roomHandlers.setup(socket);

		if (debug)
			__debugger.observe(socket, {
				fps: 10,
				style: {
					left: null,
					right: '10px',
					color: 'lime',
				},
			});

		return socket;
	} catch (error) {
		alert('Lỗi khi kết nối đến server, cần tải lại trang hoặc thử vào lại sau!');
		throw error;
	}
}

/**
 * ***Note:*** Nhận vào socket để request event đổi map/tank
 * @param {Awaited<ReturnType<typeof setupSocket>>} socket
 */
async function renderRoomModal(socket) {
	// Request IDs
	const [mapIDs, tankIDs] = await Promise.all(
		['map', 'tank'].map((endpoint) => fetch(`/ids/${endpoint}`).then((res) => res.json()))
	);

	renderMapModal(mapIDs, (mapID) => socket.emit('request:change-map', mapID));
	renderTankModal(tankIDs, (tankID) => socket.emit('request:change-tank', tankID));
}

function setupInputManager(debug = false) {
	const inputMgr = new BattleInputManager();
	if (debug) __debugger.observe(inputMgr);
	return inputMgr;
}
