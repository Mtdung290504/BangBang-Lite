import * as socketManagers from '../managers/index.js';

export default { setup };

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} playerSocket
 */
function setup(io, playerSocket) {
	const { roomManager } = socketManagers;

	// Handle player join room event
	playerSocket.on('request:join-room', async (roomID, { playerName, role }) => {
		// Check type of roomID & playerName
		if (typeof roomID !== 'string' || typeof playerName !== 'string') {
			return rejectJoinRoom(
				`> [SocketServer.RoomHandler.onEvent:join-room] Invalid type of roomID or playerName, reject`
			);
		}

		// Join room
		console.log(
			`> [SocketServer.RoomHandler.onEvent:join-room] Receive event join room: Room:[${roomID}] - Player:[${playerName}] - Role:[${role}]`
		);
		const success = await roomManager.socketJoinRoom(playerSocket, roomID, playerName, role);
		if (!success)
			return rejectJoinRoom(`> [SocketServer.RoomHandler.onEvent:join-room] roomManager.socketJoinRoom failed`);

		// Dispatch event render UI
		const roomData = roomManager.getRoomData(roomID);
		if (roomData) dispatchUpdateRoomState(roomID, roomData);
	});

	// Handle player ready/unready event
	playerSocket.on('request:toggle-ready-state', () => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		const allPlayerReady = roomManager.socketToggleReadyState(playerSocket);

		const roomData = roomManager.getRoomData(roomID);
		if (!roomData) return;

		if (allPlayerReady) {
			// Khi trận đấu bắt đầu, khóa room để không ai vào hay thay đổi tank/map được nữa
			roomManager.lockRoom(roomID);
			io.to(roomID).emit('dispatch:all-player-ready', roomData);
			return;
		}

		// Dispatch event render UI
		dispatchUpdateRoomState(roomID, roomData);
	});

	// Handle player change team event
	playerSocket.on('request:change-team', () => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		const playerName = roomManager.getPlayerName(playerSocket);
		const changeSuccess = roomManager.socketChangeTeam(playerSocket);

		if (!changeSuccess) {
			console.log(
				`> [SocketServer.RoomHandler.onEvent:change-team] Reject change team: Room::${roomID}, Player::${playerName}`
			);
			return;
		}

		// Dispatch event render UI
		const roomData = roomManager.getRoomData(roomID);
		if (roomData) dispatchUpdateRoomState(roomID, roomData);

		console.log(
			`> [SocketServer.RoomHandler.onEvent:change-team] Change team success: Room::${roomID}, Player::${playerName}`
		);
	});

	// Handle player disconnect/out room
	playerSocket.on('disconnect', () => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		console.log(
			`> [SocketServer.RoomHandler.onEvent:disconnect] Receive event disconnect: room::${roomID} - player::${roomManager.getPlayerName(
				playerSocket
			)}`
		);

		// Leave room
		roomManager.socketLeaveRoom(playerSocket);

		// Dispatch event rerender UI for another player
		const roomData = roomManager.getRoomData(roomID);
		if (roomData) dispatchUpdateRoomState(roomID, roomData);
	});

	// Handle player change map request
	playerSocket.on('request:change-map', (mapID) => {
		if (typeof mapID !== 'number') return;

		const roomID = roomManager.getSocketRoomID(playerSocket);
		const changeSuccess = roomManager.socketChangeMap(roomID, mapID);

		if (!changeSuccess) {
			console.log(
				`> [SocketServer.RoomHandler.onEvent:change-map] Reject change map of Room::${roomID} to Map::${mapID}`
			);
			return;
		}

		io.to(roomID).emit('dispatch:change-map', mapID);
	});

	// Handle player change tank request
	playerSocket.on('request:change-tank', (tankID) => {
		if (typeof tankID !== 'number') return;

		const changeSuccess = roomManager.socketChangeTank(playerSocket, tankID);
		if (!changeSuccess) {
			console.log(
				`> [SocketServer.RoomHandler.onEvent:change-tank] Reject change tank to Tank::${tankID} for Player::${roomManager.getPlayerName(
					playerSocket
				)}`
			);
			return;
		}

		playerSocket.emit('dispatch:change-tank', tankID);
	});

	// TODO: Cần cơ chế timeout sau này, đề phòng mọi người phải đợi 1 người
	playerSocket.on('dispatch:loaded', () => {
		const roomID = roomManager.getSocketRoomID(playerSocket);
		const allPlayerLoaded = roomManager.socketMarkLoaded(playerSocket);
		if (allPlayerLoaded) io.to(roomID).emit('dispatch:all-player-loaded');
	});

	/**
	 * @param {string} log
	 */
	function rejectJoinRoom(log = '') {
		if (log) console.log(log);
		playerSocket.emit('response:join-failed', 'Room đầy, đã vào trận hoặc tên room/tên nhân vật không hợp lệ');
	}

	/**
	 * @param {string} roomID
	 * @param {NonNullable<ReturnType<typeof socketManagers.roomManager.getRoomData>>} roomData
	 */
	function dispatchUpdateRoomState(roomID, roomData) {
		io.to(roomID).emit('dispatch:update-room-state', roomData);
	}
}
