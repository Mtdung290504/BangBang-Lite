import * as socketManagers from '../managers/index.js';

export default { setup };

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} playerSocket
 */
function setup(io, playerSocket) {
	const { roomManager } = socketManagers;

	playerSocket.on('request-sync:mouse-state', (mouseState) => {
		const roomID = roomManager.getSocketRoomID(playerSocket);

		// Note: Chỉ gửi cho những socket khác ngoài bản thân, dùng socket thay vì io
		playerSocket.to(roomID).emit('dispatch:sync-mouse-state', { socketID: playerSocket.id, mouseState });
	});

	playerSocket.on('request-sync:action-state', (actionState) => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		playerSocket.to(roomID).emit('dispatch:sync-action-state', { socketID: playerSocket.id, actionState });
	});

	playerSocket.on('request-sync:position-state', (positionState) => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		// playerSocket.to(roomID).emit('dispatch:sync-position-state', positionState);
		io.to(roomID).emit('dispatch:sync-position-state', positionState);
	});
}
