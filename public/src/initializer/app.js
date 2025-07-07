import BattleInputManager from '../core/managers/BattleInputManager.js';
import getConnectedSocket from '../network/socket/getConnectedSocket.js';
import * as socketHandlers from '../network/socket/handlers/socketHandlers.js';
import __debugger from '../utils/debugger.js';
__debugger.listen();

const DEBUG_MODE = true;

export async function init() {
	const socket = await setupSocket(DEBUG_MODE);
	const inputMgr = setupInputManager(DEBUG_MODE);
	inputMgr.listen();

	__debugger.hideAll();
}

async function setupSocket(debug = false) {
	const ROOM_ID = new URLSearchParams(location.search).get('room');
	const socket = await getConnectedSocket().catch((error) => {
		alert('Lỗi khi kết nối đến server, tải lại hoặc thử lại sau');
		throw error;
	});

	if (debug)
		__debugger.observe(socket, {
			fps: 10,
			style: {
				left: null,
				right: '10px',
				color: 'lime',
			},
		});

	if (ROOM_ID) await socketHandlers.initRoomHandlers(socket, ROOM_ID);
	return socket;
}

function setupInputManager(debug = false) {
	const inputMgr = new BattleInputManager();
	if (debug) __debugger.observe(inputMgr);
	return inputMgr;
}
