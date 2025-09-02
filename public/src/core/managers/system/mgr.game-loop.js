// Flags
let paused = true;
let progressLog = false;

// FPS control
const LOGIC_FPS = 60;
let renderFPS = 60;
let lastRenderTime = 0;

// Lưu trữ để không phải thực hiện phép chia nhiều lần trong render loop
let renderInterval = 1000 / renderFPS;
setRenderFPS(renderFPS);

export { LOGIC_FPS, getFPSInfo, setRenderFPS, startLogicLoop, startRenderLoop, start, stop, setProgressLog };

/**
 * @param {() => void} runner
 */
function start(runner) {
	paused = false;
	runner();
}

function stop() {
	paused = true;
}

/**
 * @param {boolean} value
 */
function setProgressLog(value) {
	progressLog = value;
}

/**
 * @param {() => void} updater
 */
function startLogicLoop(updater) {
	function updateLogic() {
		if (paused) return;
		progressLog && console.log('> [mgr.game-loop]: Logic is updating...');

		try {
			updater();
		} catch (error) {
			stop();
			console.error('> [mgr.game-loop] Game loop stopped due to error, see error log above');
		}

		setTimeout(updateLogic, 1000 / LOGIC_FPS);
	}

	updateLogic();
}

/**
 * @param {() => void} renderer
 */
function startRenderLoop(renderer) {
	/**
	 * @param {DOMHighResTimeStamp} currentTime
	 */
	function renderFrame(currentTime) {
		if (paused) return;

		// Kiểm tra đủ thời gian theo render FPS mới gọi hàm render frame tiếp theo
		// 1000 / fps = delta time (đơn vị: ms)
		if (currentTime - lastRenderTime >= renderInterval) {
			progressLog && console.log('> [mgr.game-loop]: Drawing...');

			// Render và cảnh báo frame nặng
			// const frameStart = performance.now();
			renderer();
			// const frameTime = performance.now() - frameStart;

			// Note (đơn vị: s)
			// if (frameTime > 1 / renderFPS) console.warn(`> [mgr.game-loop] Heavy frame: ${frameTime.toFixed(2)}ms`);

			lastRenderTime = currentTime;
		}

		requestAnimationFrame(renderFrame);
	}

	requestAnimationFrame(renderFrame);
}

/**
 * @param {number} fps
 */
function setRenderFPS(fps) {
	if (fps <= 0) {
		console.warn(
			"> [mgr.game-loop] Warning:\n- FPS must be between 1 and 60, above 60 is acceptable but increases the amount of rendering unnecessarily.\n- The highest rendering speed is equal to your device's frame refresh rate"
		);
		return;
	}

	renderFPS = fps + 5;
	renderInterval = 1000 / renderFPS;
	console.log(`> [mgr.game-loop] Render FPS has been set to: ${fps}`);
}

function getFPSInfo() {
	console.log(`> [mgr.game-loop] Logic FPS: ${LOGIC_FPS} (fixed)`);
	console.log(`> [mgr.game-loop] Render FPS: ${renderFPS}`);
	return renderFPS;
}
