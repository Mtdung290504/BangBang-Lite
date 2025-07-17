import * as socketManagers from '../managers/gateway.js';

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export default function setupRoomHandlers(io, socket) {
	const { roomManager } = socketManagers;

	socket.on('request:join-room', async (roomID, playerName) => {
		// Check type of roomID & playerName
		if (typeof roomID !== 'string' || typeof playerName !== 'string') {
			return rejectJoinRoom(
				`> [SocketServer.RoomHandler.onEvent:join-room] Invalid type of roomID or playerName, reject`
			);
		}

		// Join room
		console.log(
			`> [SocketServer.RoomHandler.onEvent:join-room] Receive event join room: room::${roomID} - player::${playerName}`
		);
		const success = await roomManager.socketJoinRoom(socket, roomID, playerName);
		if (!success)
			return rejectJoinRoom(`> [SocketServer.RoomHandler.onEvent:join-room] roomManager.socketJoinRoom failed`);

		// Dispatch event render UI
		const roomData = roomManager.getRoomData(roomID);
		if (roomData) dispatchUpdatePlayers(roomID, roomData);
	});

	socket.on('request:mark-ready', () => {
		const roomID = roomManager.getSocketRoomID(socket);
		roomManager.socketMarkReady(socket);

		// Dispatch event render UI
		const roomData = roomManager.getRoomData(roomID);
		if (roomData?.readyPlayers) {
			dispatchUpdatePlayers(roomID, { readyPlayers: roomData.readyPlayers });
		}
	});

	socket.on('request:unmark-ready', () => {
		const roomID = roomManager.getSocketRoomID(socket);
		roomManager.socketUnmarkReady(socket);

		// Dispatch event render UI
		const roomData = roomManager.getRoomData(roomID);
		if (roomData?.readyPlayers) {
			dispatchUpdatePlayers(roomID, { readyPlayers: roomData.readyPlayers });
		}
	});

	socket.on('disconnect', () => {
		const roomID = roomManager.getSocketRoomID(socket);
		console.log(
			`> [SocketServer.RoomHandler.onEvent:disconnect] Receive event disconnect: room::${roomID} - player::${roomManager.getPlayerName(
				socket
			)}`
		);

		// Leave room
		roomManager.socketLeaveRoom(socket);

		// Dispatch event rerender UI for another player
		const roomData = roomManager.getRoomData(roomID);
		if (roomData) dispatchUpdatePlayers(roomID, roomData);
	});

	/**
	 * @param {string} log
	 */
	function rejectJoinRoom(log = null) {
		if (log) console.log(log);
		socket.emit('response:join-failed', 'Room đầy, hoặc tên room/tên nhân vật không hợp lệ');
	}

	/**
	 * @param {string} roomID
	 * @param {ReturnType<typeof roomManager.getRoomData>} roomData
	 */
	function dispatchUpdatePlayers(roomID, roomData) {
		io.to(roomID).emit('dispatch:update-players', roomData);
	}
}
