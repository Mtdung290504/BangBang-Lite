/**
 * Tạo tick engine sử dụng Web Worker để tránh throttling khi tab bị blur
 * @param {TickEngineOptions} [options={}] - Cấu hình khởi tạo
 *
 * @example
 * const tickManager = createTickEngine({ enableLogging: true });
 *
 * // Đăng ký game loop chính 60 FPS
 * tickManager.addTicker({ name: 'game-loop', fps: 60, autoStart: true }, (event) => {
 *   updateGame(event.deltaTime);
 *   render();
 * });
 *
 * // Đăng ký AI update chậm hơn
 * tickManager
 * 	.addTicker({ name: 'AI-update', fps: 10, data: { difficulty: 'hard' } }, (event) => {
 *   	updateAI(event.data?.difficulty);
 * 	})
 * 	.startTicker('AI-update');
 */
export function createTickEngine(options = {}) {
	// Modules
	const log = createLogger(options.enableLogging);
	const tickerStore = createTickerStore();
	const workerManager = createWorker();

	// State
	let isActive = true;

	// Setup worker message handling
	workerManager.worker.onmessage = (e) => {
		if (!e.data || typeof e.data !== 'object') return;

		const data = /** @type {WorkerResponse} */ (e.data);

		if (data.type === 'tick' && typeof data.name === 'string') {
			const tickerReg = tickerStore.tickers.get(data.name);
			if (!tickerReg) return;

			const { name, deltaTime, frame, timestamp, type, data: tickData } = data;

			/** @type {TickEvent} */
			const event = { type, name, timestamp, frame, deltaTime, data: tickData };
			tickerReg.frameCount = frame;
			tickerReg.handler(event);
		}

		if (e.data.error) {
			console.log(e.data);
		}
	};
	workerManager.worker.onerror = (/** @type {ErrorEvent} */ error) =>
		console.error('Tick-Engine Worker Error:', error);

	const ensureActive = () => {
		if (!isActive) throw new Error('Tick-Engine has been destroyed');
	};

	// Public API
	const api = {
		/**
		 * Đăng ký một ticker mới
		 *
		 * @param {TickerConfig} config - Cấu hình ticker
		 * @param {TickerHandler} handler - Function xử lý tick event
		 * @throws {Error} Nếu engine đã dừng
		 */
		addTicker: (config, handler) => {
			ensureActive();
			let { name, fps, autoStart, data } = config;
			fps = Math.max(10, fps);

			if (tickerStore.tickers.has(name)) {
				log(`Warning: Overriding existing ticker [${name}]`);
				api.stopTicker(name);
			}

			/** @type {TickerRegistration} */
			const tickerReg = { name, fps, isRunning: false, frameCount: 0, handler, data: data };
			tickerStore.add(name, tickerReg);
			log(`Added ticker [${name}] with [${fps}] FPS`);

			if (autoStart === true) api.startTicker(name);
			return api;
		},

		/**
		 * Bắt đầu chạy một ticker đã đăng ký
		 *
		 * @param {string} name - Tên ticker cần start
		 * @throws {Error} Nếu ticker không tồn tại
		 */
		startTicker: (name) => {
			ensureActive();

			const tickerReg = tickerStore.tickers.get(name);
			if (!tickerReg) throw new Error(`Ticker [${name}] not found`);
			if (tickerReg.isRunning) {
				log(`Ticker [${name}] is already running`);
				return api;
			}

			/** @type {WorkerMessage} */
			const message = { command: 'start', name, fps: tickerReg.fps, data: tickerReg.data };
			workerManager.worker.postMessage(message);

			tickerReg.isRunning = true;
			tickerReg.frameCount = 0;
			log(`Started ticker [${name}]`);

			return api;
		},

		/**
		 * Dừng một ticker đang chạy
		 *
		 * @param {string} name - Tên ticker cần stop
		 * @throws {Error} Nếu ticker không tồn tại
		 */
		stopTicker: (name) => {
			ensureActive();

			const tickerReg = tickerStore.tickers.get(name);
			if (!tickerReg) throw new Error(`Ticker [${name}] not found`);
			if (!tickerReg.isRunning) {
				log(`Ticker [${name}] is not running`);
				return api;
			}

			/** @type {WorkerMessage} */
			const message = { command: 'stop', name, fps: 0 };
			workerManager.worker.postMessage(message);

			tickerReg.isRunning = false;
			log(`Stopped ticker [${name}]`);

			return api;
		},

		/**
		 * Cập nhật FPS cho một ticker
		 *
		 * @param {string} name - Tên ticker
		 * @param {number} fps - FPS mới (min là 10, giới hạn trên bằng fps thiết bị)
		 * @throws {Error} Nếu ticker không tồn tại hoặc FPS không hợp lệ
		 */
		setTickerFPS: (name, fps) => {
			ensureActive();
			fps = Math.max(10, fps);

			const tickerReg = tickerStore.tickers.get(name);
			if (!tickerReg) throw new Error(`Ticker [${name}] not found`);

			tickerReg.fps = fps;
			log(`Updated FPS for ticker [${name}] to ${fps}`);

			if (tickerReg.isRunning) {
				/** @type {WorkerMessage} */
				const message = { command: 'updateFPS', name, fps };
				workerManager.worker.postMessage(message);
			}

			return api;
		},

		/**
		 * Xóa một ticker
		 * @param {string} name - Tên ticker cần xóa
		 */
		removeTicker: (name) => {
			if (!tickerStore.tickers.has(name)) {
				log(`Ticker [${name}] not found`);
				return api;
			}

			const tickerReg = tickerStore.tickers.get(name);
			if (tickerReg && tickerReg.isRunning) {
				api.stopTicker(name);
			}

			tickerStore.tickers.delete(name);
			log(`Removed ticker [${name}]`);

			return api;
		},

		/**
		 * Dừng tất cả tickers đang chạy
		 */
		stopAllTickers: () => {
			ensureActive();

			/** @type {WorkerMessage} */
			const message = { command: 'stopAll', name: '', fps: 0 };
			workerManager.worker.postMessage(message);

			tickerStore.forEach((tickerReg) => (tickerReg.isRunning = false));
			log('Stopped all tickers');

			return api;
		},

		/**
		 * Cleanup và giải phóng resources
		 * Gọi method này khi không sử dụng engine nữa
		 */
		destroy: () => {
			if (!isActive) return;

			api.stopAllTickers();
			workerManager.destroy();
			tickerStore.tickers.clear();

			isActive = false;
			log('Tick-Engine destroyed');
		},
	};

	log('Tick-Engine initialized successfully');
	return api;
}

/**
 * Tạo ticker store để quản lý registered tickers
 */
function createTickerStore() {
	/** @type {Map<string, TickerRegistration>} */
	const tickers = new Map();

	/**
	 * Thêm ticker vào store
	 *
	 * @param {string} name - Tên ticker
	 * @param {TickerRegistration} tickerReg - Ticker registration
	 */
	const add = (name, tickerReg) => tickers.set(name, tickerReg);

	/**
	 * Iterate qua tất cả tickers
	 * @param {function(TickerRegistration, string): void} callback
	 */
	const forEach = (callback) => {
		for (const [name, tickerReg] of tickers) {
			callback(tickerReg, name);
		}
	};

	return { tickers, add, forEach };
}

/**
 * Tạo và quản lý Web Worker instance
 *
 * @returns {WorkerManager}
 * @throws {Error} Nếu không thể tạo worker
 */
function createWorker() {
	try {
		const worker = new Worker(new URL('./workers/worker.tick-dispatcher.js', import.meta.url));
		return { worker, destroy: () => worker.terminate() };
	} catch (error) {
		console.error(`> [mgr.game-loop.tick-engine] Failed to create worker:`, error);
		throw error;
	}
}

/**
 * Tạo logger instance
 *
 * @param {boolean} [enabled=false] - Có enable logging không
 * @returns {function(...*): void} Log function
 */
function createLogger(enabled = false) {
	return enabled ? (/** @type {...*} */ ...args) => console.log('> [mgr.game-loop.tick-engine]', ...args) : () => {}; // No-op
}

/**
 * @typedef {Object} TickerConfig
 * @property {string} name - Tên của ticker
 * @property {number} fps - Tần suất frames per second (min là 10, giới hạn trên bằng fps thiết bị)
 * @property {boolean} [autoStart=false] - Tự động start khi đăng ký
 * @property {*} [data] - Data tùy chỉnh được gửi cùng tick event
 */

/**
 * @typedef {Object} TickEvent
 * @property {'tick'} type - Loại event ('tick')
 * @property {string} name - Tên ticker đã đăng ký
 * @property {number} timestamp - Timestamp hiện tại (Date.now())
 * @property {number} frame - Frame number từ khi start
 * @property {number} deltaTime - Thời gian từ frame trước (ms)
 * @property {*} [data] - Data tùy chỉnh từ config
 */

/**
 * @callback TickerHandler
 * @param {TickEvent} event - Event object chứa thông tin timing
 * @returns {void}
 */

/**
 * @typedef {Object} TickerRegistration
 * @property {string} name - Tên ticker
 * @property {number} fps - FPS hiện tại
 * @property {boolean} isRunning - Trạng thái chạy
 * @property {number} frameCount - Số frame đã chạy
 * @property {TickerHandler} handler - Ticker handler
 * @property {*} [data] - Custom data
 */

/**
 * @typedef {Object} TickEngineOptions
 * @property {boolean} [enableLogging=false] - Bật logging debug
 */

/**
 * @typedef {Object} WorkerMessage
 * @property {'start' | 'stop' | 'updateFPS' | 'stopAll'} command
 * @property {string} name
 * @property {number} fps
 * @property {*} [data]
 */

/**
 * @typedef {Object} WorkerResponse
 * @property {'tick'} type
 * @property {string} name
 * @property {number} timestamp
 * @property {number} frame
 * @property {number} deltaTime
 * @property {*} [data]
 */

/**
 * @typedef {Object} WorkerManager
 * @property {Worker} worker
 * @property {function(): void} destroy
 */
