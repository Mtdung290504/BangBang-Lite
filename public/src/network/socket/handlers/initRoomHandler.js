import { renderRoomID } from '../../../UIs/roomUI.js';

/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

/**
 * @param {Socket} socket
 */
export function initRoomHandlers(socket) {
	socket.on('response:join-success', (roomID, callback) => {
		console.log('> [Socket.RoomHandler.onEvent:join-success] Join room success, room ID:', roomID);

		// TODO: Send ack
		callback({ success: true });

		// TODO: Render roomID UI
		renderRoomID(roomID);
	});

	socket.on('response:join-failed', (msg) => {
		alert(`Không thể vào phòng, nguyên nhân: ${msg}`);
		location.href = '/';
	});

	socket.on('dispatch:update-players', (data) => {
		console.log('> [Socket.RoomHandler.onEvent:update-players] Receive players data in room:', data);
	});
}
