import { Server } from 'socket.io';

/** @type {import('./@types')['initSocketServer']} */
export default function initSocketServer(server) {
	const io = new Server(server, {
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
