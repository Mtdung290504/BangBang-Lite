/** @type {Map<string, {intervalId: number, fps: number, frameCount: number, data: any}>} */
const timers = new Map();

/**
 * Start timer cho một event
 *
 * @param {string} name - Tên event
 * @param {number} fps - Frames per second
 * @param {*} [data=null] - Custom data
 */
function startTimer(name, fps, data = null) {
	if (timers.has(name)) {
		const existingTimer = timers.get(name);
		if (existingTimer && existingTimer.timeoutId) {
			clearTimeout(existingTimer.timeoutId);
		}
	}

	let frameCount = 0;
	let lastTimestamp = performance.now();
	const targetInterval = 1000 / fps;

	function tick() {
		const currentTimestamp = performance.now();
		const deltaTime = currentTimestamp - lastTimestamp;

		self.postMessage({
			type: 'tick',
			name: name,
			timestamp: currentTimestamp,
			frame: ++frameCount,
			deltaTime: deltaTime,
			data: data,
		});

		lastTimestamp = currentTimestamp;

		// Recursive setTimeout với timing correction
		const timeoutId = setTimeout(tick, targetInterval);

		// Update stored timer
		const timer = timers.get(name);
		if (timer) timer.timeoutId = timeoutId;
	}

	// Start first tick
	const timeoutId = setTimeout(tick, targetInterval);
	timers.set(name, { timeoutId, fps, frameCount: 0, data });
}

/**
 * Stop timer cho một event
 * @param {string} name - Tên event
 */
function stopTimer(name) {
	const timer = timers.get(name);
	if (!timer) return;

	clearTimeout(timer.timeoutId); // Đổi từ clearInterval
	timers.delete(name);
}

/**
 * Update FPS cho timer đang chạy
 *
 * @param {string} name - Tên event
 * @param {number} fps - FPS mới
 */
function updateTimerFPS(name, fps) {
	const timer = timers.get(name);
	if (!timer) return;

	stopTimer(name);
	startTimer(name, fps, timer.data);
}

// Message handler
self.onmessage = function (e) {
	if (!e.data || typeof e.data !== 'object') return;

	const { command, name, fps, data } = e.data;
	if (typeof command !== 'string' || typeof name !== 'string') return;

	switch (command) {
		case 'start':
			if (typeof fps === 'number') {
				startTimer(name, fps, data);
			}
			break;

		case 'stop':
			stopTimer(name);
			break;

		case 'updateFPS':
			if (typeof fps === 'number') {
				updateTimerFPS(name, fps);
			}
			break;

		case 'stopAll':
			for (const [timerName] of timers) {
				stopTimer(timerName);
			}
			break;
	}
};
// Thêm vào đầu file worker
self.onerror = function (message, source, lineno, colno, error) {
	self.postMessage({ message, source, lineno, colno, error });
	return false;
};

self.onunhandledrejection = function (event) {
	self.postMessage({ error: event.reason });
};
