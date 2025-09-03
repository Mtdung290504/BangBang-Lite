import { Server as SocketServer } from 'socket.io';
import { setupRoomHandlers, setupBattleHandlers } from './handlers/index.js';

/**
 * Initialize socket.io and attach to an HTTP server
 *
 * @param {import('http').Server} server HTTP server (http.createServer(...))
 * @returns {SocketServer} instance of Socket.IO server
 */
export default function initSocketServer(server) {
	const io = new SocketServer(server, {
		cors: {
			origin: '*',
		},
	});

	io.on('connection', (socket) => {
		console.log('> [SocketServer] Client connected:', socket.id, '\n');

		setupRoomHandlers(io, socket);
		setupBattleHandlers(io, socket);

		socket.on('disconnect', (reason) =>
			console.log('> [SocketServer] Client disconnected:', socket.id, '\n\t-> Reason:', reason, '\n')
		);
	});

	return io;
}
