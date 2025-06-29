import BattleInputManager from './src/core/managers/BattleInputManager.js';
import getConnectedSocket from './src/network/socket/getConnectedSocket.js';
import initRoomHandlers from './src/network/socket/handlers/initRoomHandler.js';
import __debugger from './src/utils/debugger.js';
__debugger.start();

const ROOM_ID = new URLSearchParams(location.search).get('room');
console.log(ROOM_ID);
const socket = await getConnectedSocket().catch((error) => {
	alert('Lỗi khi kết nối đến server, tải lại hoặc thử lại sau');
	throw error;
});
__debugger.observe(socket, {
	fps: 10,
	style: {
		left: null,
		right: '10px',
		color: 'lime',
	},
});
if (ROOM_ID) await initRoomHandlers(socket, ROOM_ID);

const inputMgr = new BattleInputManager();
inputMgr.listen();
__debugger.observe(inputMgr);
