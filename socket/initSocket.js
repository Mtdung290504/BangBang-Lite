import { Server } from 'socket.io';

/** @type {import('./@types')['initSocket']} */
export default function initSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: '*',
		},
	});

	io.on('connection', (socket) => {
		console.log('Client connected:', socket.id);

		socket.on('disconnect', (reason) => {
			console.log('Client disconnected:', socket.id, reason);
		});
	});

	return io;
}
