/**
 * Tạo một fake socket để mô phỏng hành vi socket thật trong môi trường sandbox
 *
 * @example
 * // Tạo socket với cấu hình mặc định (mạng bình thường 20-50ms)
 * const socket = getSandboxSocket();
 *
 * // Hoặc dùng preset
 * const fastSocket = getSandboxSocket();
 * fastSocket.updateConfig('local');  // 1-5ms cho localhost
 *
 * const slowSocket = getSandboxSocket();
 * slowSocket.updateConfig('poor');   // 80-150ms cho mạng chậm
 *
 * // Custom config
 * const customSocket = getSandboxSocket({
 *      minDelay: 25,
 *      maxDelay: 40,
 *      errorRate: 0.01  // 1% lỗi
 * });
 *
 * // Thay đổi runtime
 * socket.updateConfig('mobile'); // Chuyển sang mobile network
 * socket.updateConfig({ minDelay: 30, maxDelay: 60 }); // Custom
 */
export default function getSandboxSocket(config = {}) {
	// Cấu hình mặc định cho network delay (dựa trên thực tế)
	const defaultConfig = {
		minDelay: 20, // Delay tối thiểu (ms) - mạng tốt
		maxDelay: 50, // Delay tối đa (ms) - mạng bình thường
		errorRate: 0, // Tỷ lệ lỗi (0-1, 0 = không có lỗi)
		// Preset cho các tình huống khác nhau
		presets: {
			local: { minDelay: 1, maxDelay: 5 }, // LAN/localhost
			good: { minDelay: 15, maxDelay: 35 }, // Mạng tốt
			normal: { minDelay: 20, maxDelay: 50 }, // Mạng bình thường (default)
			poor: { minDelay: 80, maxDelay: 150 }, // Mạng chậm
			mobile: { minDelay: 40, maxDelay: 80 }, // Mobile network
		},
	};

	const settings = { ...defaultConfig, ...config };

	// Map để lưu trữ các event handlers
	const eventHandlers = new Map();

	/**
	 * Mô phỏng network delay
	 * @param {number} min - Delay tối thiểu (ms)
	 * @param {number} max - Delay tối đa (ms)
	 */
	const simulateNetworkDelay = (min = settings.minDelay, max = settings.maxDelay) => {
		return new Promise((resolve) => {
			const delay = Math.random() * (max - min) + min;
			setTimeout(resolve, delay);
		});
	};

	/**
	 * Mô phỏng network error ngẫu nhiên
	 */
	const shouldSimulateError = () => {
		return Math.random() < settings.errorRate;
	};

	/**
	 * Thêm event listener cho một event cụ thể
	 * @param {string} eventName - Tên event
	 * @param {Function} callback - Callback function
	 */
	const on = (eventName, callback) => {
		if (typeof eventName !== 'string' || typeof callback !== 'function') {
			throw new Error('Invalid arguments for on()');
		}

		if (!eventHandlers.has(eventName)) {
			eventHandlers.set(eventName, []);
		}
		eventHandlers.get(eventName).push(callback);
	};

	/**
	 * Thêm event listener một lần (tự động remove sau khi trigger)
	 * @param {string} eventName - Tên event
	 * @param {Function} callback - Callback function
	 */
	const once = (eventName, callback) => {
		if (typeof eventName !== 'string' || typeof callback !== 'function') {
			throw new Error('Invalid arguments for once()');
		}

		const onceWrapper = (...args) => {
			callback(...args);
			off(eventName, onceWrapper);
		};
		on(eventName, onceWrapper);
	};

	/**
	 * Xóa event listener
	 * @param {string} eventName - Tên event
	 * @param {Function} callback - Callback function cần xóa (optional)
	 */
	const off = (eventName, callback) => {
		if (!eventHandlers.has(eventName)) return;

		if (callback) {
			// Xóa callback cụ thể
			const handlers = eventHandlers.get(eventName);
			const index = handlers.indexOf(callback);
			if (index !== -1) {
				handlers.splice(index, 1);
			}

			// Xóa event key nếu không còn handlers
			if (handlers.length === 0) {
				eventHandlers.delete(eventName);
			}
		} else {
			// Xóa tất cả handlers của event
			eventHandlers.delete(eventName);
		}
	};

	/**
	 * Trigger một event với data (internal method)
	 * @param {string} eventName - Tên event
	 * @param {...any} args - Arguments truyền cho callback
	 */
	const trigger = (eventName, ...args) => {
		if (!eventHandlers.has(eventName)) return;

		const handlers = eventHandlers.get(eventName);

		// Gọi tất cả handlers
		handlers.forEach((handler) => {
			try {
				// Mô phỏng async callback (như socket thật)
				setTimeout(() => handler(...args), 0);
			} catch (error) {
				console.error(`> [SandboxSocket] Error in handler for event "${eventName}":`, error);
			}
		});
	};

	/**
	 * Emit event đến "server"
	 * @param {string} eventName - Tên event
	 * @param {...any} args - Data và callback
	 */
	const emit = async (eventName, ...args) => {
		if (typeof eventName !== 'string') {
			throw new Error('Event name must be a string');
		}

		// Tách callback (nếu có) ra khỏi arguments
		let callback = null;
		let data = args;

		if (args.length > 0 && typeof args[args.length - 1] === 'function') {
			callback = args.pop();
			data = args.length === 1 ? args[0] : args;
		}

		// Mô phỏng network delay
		await simulateNetworkDelay();

		// Mô phỏng network error
		if (shouldSimulateError()) {
			trigger('error', new Error('Network error'));
			return;
		}

		// Socket chỉ emit, không xử lý logic
		// Logic xử lý sẽ được handle ở layer khác

		// Nếu có callback, gọi nó với generic response
		if (callback && typeof callback === 'function') {
			setTimeout(() => {
				try {
					callback({ success: true, timestamp: Date.now() });
				} catch (error) {
					console.error('> [SandboxSocket] Error in emit callback:', error);
				}
			}, 0);
		}
	};

	/**
	 * Xóa tất cả listeners
	 * @param {string} eventName - Tên event (optional)
	 */
	const removeAllListeners = (eventName) => {
		if (eventName) {
			eventHandlers.delete(eventName);
		} else {
			eventHandlers.clear();
		}
	};

	/**
	 * Cập nhật cấu hình network
	 * @param {Object|string} configOrPreset - Cấu hình mới hoặc tên preset
	 */
	const updateConfig = (configOrPreset) => {
		if (typeof configOrPreset === 'string') {
			// Sử dụng preset
			const preset = settings.presets[configOrPreset];
			if (preset) {
				Object.assign(settings, preset);
			} else {
				console.warn(`> [SandboxSocket] Unknown preset: ${configOrPreset}`);
			}
		} else {
			// Cấu hình custom
			Object.assign(settings, configOrPreset);
		}
	};

	/**
	 * Lấy cấu hình hiện tại
	 */
	const getConfig = () => ({ ...settings });

	// Auto-trigger connect event để mô phỏng socket ready
	setTimeout(() => trigger('connect'), 0);

	// Return fake socket object với interface giống socket.io
	return {
		inSandboxMode: true,

		// Core methods
		emit,
		on,
		once,
		off,
		removeAllListeners,

		// Configuration methods
		updateConfig,
		getConfig,

		// Properties giống socket.io
		get id() {
			return '[SandboxSocket]:' + Math.random().toString(36).substring(2, 18);
		},
	};
}
