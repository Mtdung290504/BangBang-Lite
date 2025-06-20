import { Server as SocketServer } from 'socket.io';

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

		socket.on('disconnect', (reason) => {
			console.log('> [Socket Server] Client disconnected:', socket.id, '\n\t-> Reason:', reason);
		});
	});

	return io;
}
