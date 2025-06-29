import * as socketManagers from '../managers/socketManagers.js';

/**
 * @param {import('socket.io').Socket} socket
 */
export default function initRoomHandlers(socket) {
	const { roomManager } = socketManagers;

	socket.on('join-room', (roomID) => {
		console.log('> [Socket Server.room-handler] Player join room:', roomID);
		const success = roomManager.joinRoom(roomID, socket);
		if (success) {
			socket.emit('join-success', { roomID: '10' });
		} else {
			socket.emit('join-failed', 'Room đã đủ người, hãy tham gia room khác');
		}
	});

	socket.on('ready', () => {
		roomManager.markReady(socket);
	});

	socket.on('player-move', (data) => {
		const roomID = socket.data.roomID;
		if (!roomID) return;
		socket.to(roomID).emit('opponent-move', { id: socket.id, ...data });
	});

	socket.on('cast-skill', (data) => {
		const roomID = socket.data.roomID;
		if (!roomID) return;
		socket.to(roomID).emit('opponent-cast-skill', { id: socket.id, ...data });
	});

	socket.on('game-end', (data) => {
		const roomID = socket.data.roomID;
		if (!roomID) return;
		socket.to(roomID).emit('opponent-ended', { id: socket.id, ...data });
	});

	socket.on('disconnect', () => {
		roomManager.leaveRoom(socket);
	});
}
