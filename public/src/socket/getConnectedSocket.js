import { io } from '../../libs/socket.io.js';

/**@type {import('./@types.js')['initSocket']} */
function getSocketConnection() {
	return new Promise((resolve, reject) => {
		/**@type {import('socket.io-client').Socket} */
		const socket = io();
		const timeoutMs = 5_000;

		// Timeout processing when connection is not possible
		const timer = setTimeout(() => {
			socket.disconnect();
			reject(new Error(`> [Socket] Socket connection timeout after ${timeoutMs}ms`));
		}, timeoutMs);

		// Processing when connection is successful
		socket.on('connect', () => {
			clearTimeout(timer);
			console.log('> [Socket] Connected to server, socket ID:', socket.id);
			resolve(socket);
		});

		// Handling connection errors (when unable to connect, network error...)
		socket.on('connect_error', (err) => {
			clearTimeout(timer);
			reject(err);
		});
	});
}

let socket = null;

/**@type {import('./@types')['getConnectedSocket']} */
export default async function getConnectedSocket() {
	if (!socket) {
		try {
			socket = await getSocketConnection();
			console.log('> [Socket] Socket connection successful:', socket);
		} catch (err) {
			console.error('> [Socket] Failed to connect socket:', err);
		}
	}

	return socket;
}
