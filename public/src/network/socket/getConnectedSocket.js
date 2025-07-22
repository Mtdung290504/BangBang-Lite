import { io } from '../../../libs/socket.io.js';

/**
 * Initializes a socket.io client connection with error handling and timeout.
 * Khởi tạo socket.io client và đợi nó connect thành công. Throw lỗi khi fail hoặc timeout.
 *
 * @returns {Promise<import('socket.io-client').Socket>}
 */
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

/**@type {Awaited<ReturnType<typeof getSocketConnection>> | null} */
let socket = null;

/**
 * - Initializes and returns a connected socket. If the connection fails, returns null.
 * - Note: This function maintains a single socket instance and only creates a new one if none exists.
 *
 * @returns {Promise<import('socket.io-client').Socket>}
 */
export default async function getConnectedSocket() {
	if (!socket) {
		try {
			socket = await getSocketConnection();
			console.log('> [Socket] Socket connection successful:', socket);
		} catch (err) {
			console.error('> [Socket] Failed to connect socket:', err);
			throw err;
		}
	}

	return socket;
}
