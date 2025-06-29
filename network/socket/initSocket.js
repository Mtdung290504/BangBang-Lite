import { Server as SocketServer } from 'socket.io';
import * as socketHandlers from './handlers/socketHanders.js';

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
		console.log('> [Socket Server] Client connected:', socket.id);

		socketHandlers.initRoomHandlers(socket);

		socket.on('disconnect', (reason) => {
			console.log('> [Socket Server] Client disconnected:', socket.id, '\n\t-> Reason:', reason);
		});
	});

	return io;
}
