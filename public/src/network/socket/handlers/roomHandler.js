/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

let firstInit = true;

/**
 * @param {Socket} socket
 */
export function setup(socket) {
	socket.on('response:join-failed', (msg) => {
		alert(`Không thể vào room, nguyên nhân: ${msg}`);
		location.href = '/';
	});

	socket.on('dispatch:update-players', (data) => {
		// First time connect, receive update-player event
		if (firstInit) {
			console.log('> [Socket.RoomHandler.onEvent:join-success] Join room success');
			firstInit = false;
		}

		console.log('> [Socket.RoomHandler.onEvent:update-players] Receive players data in room:', data);
	});
}
