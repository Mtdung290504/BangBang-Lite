/**@type {Map<number, { players: import('socket.io').Socket[], ready: Set<string> }>} */
const rooms = new Map();

export default { joinRoom, leaveRoom, markReady };

function joinRoom(roomID, socket) {
	let room = rooms.get(roomID);
	if (!room) {
		room = { players: [], ready: new Set() };
		rooms.set(roomID, room);
	}

	if (room.players.length >= 2) return false;

	room.players.push(socket);
	socket.join(roomID);
	socket.data.roomID = roomID;
	return true;
}

function leaveRoom(socket) {
	const roomID = socket.data.roomID;
	if (!roomID) return;

	const room = rooms.get(roomID);
	if (!room) return;

	room.players = room.players.filter((s) => s.id !== socket.id);
	room.ready.delete(socket.id);
	socket.leave(roomID);

	if (room.players.length === 0) {
		rooms.delete(roomID);
	} else {
		room.players.forEach((socket) => socket.emit('opponent-left'));
	}
}

function markReady(socket) {
	const room = rooms.get(socket.data.roomID);
	if (!room) return;

	room.ready.add(socket.id);

	if (room.ready.size === 2) {
		room.players.forEach((socket) => socket.emit('game-start'));
	}
}
