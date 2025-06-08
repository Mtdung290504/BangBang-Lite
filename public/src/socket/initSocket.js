import { io } from '../../libs/socket.io.js';

/**@type {import('./@types')['initSocket']} */
export default function initSocket() {
	return new Promise((resolve, reject) => {
		/**@type {import('socket.io-client').Socket} */
		const socket = io();

		// Thời gian timeout kết nối (ms)
		const timeoutMs = 5_000;

		// Timeout xử lý khi không kết nối được
		const timer = setTimeout(() => {
			socket.disconnect();
			reject(new Error(`Socket connection timeout after ${timeoutMs}ms`));
		}, timeoutMs);

		// Khi kết nối thành công
		socket.on('connect', () => {
			clearTimeout(timer);
			console.log('Connected to server, socket ID:', socket.id);
			resolve(socket);
		});

		// Xử lý lỗi kết nối (khi không thể kết nối, lỗi mạng...)
		socket.on('connect_error', (err) => {
			clearTimeout(timer);
			reject(err);
		});

		// Ngoài ra có thể lắng nghe thêm các lỗi khác nếu cần
	});
}

try {
	const socket = await initSocket();
	console.log('Socket connected:', socket);
} catch (err) {
	console.error('Failed to connect socket:', err);
}
