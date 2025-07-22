import BattleInputManager from '../core/managers/BattleInputManager.js';
import getConnectedSocket from '../network/socket/getConnectedSocket.js';
import { roomHandlers } from '../network/socket/handlers/gateway.js';
import { renderMapModal, setRoomIDView, renderTankModal } from '../UIs/roomUI.js';
import __debugger from '../utils/debugger.js';
__debugger.listen();

const DEBUG_MODE = true;

export async function init() {
	const socket = await setupSocket(DEBUG_MODE);
	const inputMgr = setupInputManager(DEBUG_MODE);
	inputMgr.listen();

	// Request join room
	const roomID = requestJoinRoom(socket);
	setRoomIDView(roomID);

	__debugger.hideAll();

	await renderRoomModal(socket);
}

async function setupSocket(debug = false) {
	const socket = await getConnectedSocket().catch((error) => {
		alert('Lỗi khi kết nối đến server, tải lại hoặc thử lại sau');
		throw error;
	});
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
}

/**
 * @param {Awaited<ReturnType<typeof setupSocket>>} socket
 */
function requestJoinRoom(socket) {
	const roomID = new URLSearchParams(location.search).get('room').trim();
	let playerName = '';

	while (!playerName || !playerName.trim()) playerName = prompt('Enter do nêm:');
	if (!roomID || !playerName) location.href = '/';

	socket.emit('request:join-room', roomID, playerName);
	return roomID;
}

/**
 * ***Note:*** Nhận vào socket để request event đổi map/tank
 * @param {Awaited<ReturnType<typeof setupSocket>>} socket
 */
async function renderRoomModal(socket) {
	const mapIDsRequest = import('/assets/jsons/mapIDs.js');
	const tankIDsRequest = import('/assets/jsons/tankIDs.js');
	const [mapIDs, tankIDs] = (await Promise.all([mapIDsRequest, tankIDsRequest])).map((module) => module.default);

	renderMapModal(mapIDs, (mapID) => socket.emit('request:change-map', mapID));
	renderTankModal(tankIDs, (tankID) => socket.emit('request:change-tank', tankID));
}

function setupInputManager(debug = false) {
	const inputMgr = new BattleInputManager();
	if (debug) __debugger.observe(inputMgr);
	return inputMgr;
}
