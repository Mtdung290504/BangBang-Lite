/**
 * @param {import('socket.io-client').Socket} socket
 * @param {`${number}`} roomID
 */
export default async function initRoomHandlers(socket, roomID) {
	socket.emit('join-room', roomID);

	return new Promise((resolve, reject) => {
		socket.once('join-success', ({ roomID }) => {
			console.log('> [Socket.room-handler] Join room success, room ID:', roomID);
			resolve();
		});

		socket.once('join-failed', (msg) => {
			alert(`Không thể vào phòng: ${msg}`);
			reject(msg);
		});
	});
}
