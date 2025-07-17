import * as socketManagers from '../managers/gateway.js';

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export default function initRoomHandlers(io, socket) {
	const { roomManager } = socketManagers;

	socket.on(
		'request:join-room',
		/**
		 * @param {string} roomID
		 * @param {string} playerName
		 */
		async (roomID, playerName) => {
			console.log(
				`> [SocketServer.RoomHandler.onEvent:join-room] Receive event join room: room::${roomID} - player::${playerName}`
			);
			const success = await roomManager.socketJoinRoom(socket, roomID, playerName);

			if (success) {
				console.log(
					`> [SocketServer.RoomHandler.onEvent:join-room] Join room::${roomID} for player::${playerName} success, wait for client ack`
				);
				try {
					// Send success response, dispatch event build UI
					await socket.timeout(1000).emitWithAck('response:join-success', roomID);
					console.log(`> [SocketServer.onEvent:join-room]: Player::${playerName} join success`, '\n');

					// Dispatch event render UI
					const roomData = roomManager.getRoomData(roomID);
					if (roomData) io.to(roomID).emit('dispatch:update-players', roomData);
				} catch (e) {
					console.log(
						`> [SocketServer.RoomHandler.onEvent:join-room]: Player::${playerName} not response, ignore`,
						'\n'
					);
					roomManager.socketLeaveRoom(socket);
				}

				return;
			}
			socket.emit('response:join-failed', 'Room đầy, hoặc tên room/tên không hợp lệ');
		}
	);

	socket.on('ready', () => {
		roomManager.socketMarkReady(socket);
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
		if (roomData) io.to(roomID).emit('dispatch:update-players', roomData);
	});
}
