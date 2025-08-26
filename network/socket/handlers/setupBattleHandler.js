import * as socketManagers from '../managers/index.js';

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} playerSocket
 */
export default function setupBattleHandlers(io, playerSocket) {
	const { roomManager } = socketManagers;

	playerSocket.on('request:sync-input', (syncInputData) => {
		const roomID = roomManager.getSocketRoomID(playerSocket);

		// Note: trước mắt chỉ gửi cho những socket khác ngoài bản thân, dùng socket
		playerSocket.to(roomID).emit('dispatch:sync-input', { playerID: playerSocket.id, syncInputData });
	});
}
