// Flags
let paused = true;
let progressLog = false;

// FPS control
const LOGIC_FPS = 60;
let renderFPS = 60;
let lastRenderTime = 0;
let renderInterval = 1000 / renderFPS;

export { getFPSInfo, setRenderFPS, startLogicLoop, startRenderLoop, startGame, stopGame, setProgressLog };

/**
 * @param {() => void} runner
 */
function startGame(runner) {
	paused = false;
	runner();
}

function stopGame() {
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
		progressLog && console.log('> [Managers.game-loop]: Logic is updating...');
		updater();
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
		if (currentTime - lastRenderTime >= renderInterval) {
			progressLog && console.log('> [Managers.game-loop]: Drawing...');

			// Render và cảnh báo frame nặng
			const frameStart = performance.now();
			renderer();
			const frameTime = performance.now() - frameStart;
			if (frameTime > 1 / renderFPS)
				console.warn(`> [Managers.game-loop] Heavy frame: ${frameTime.toFixed(2)}ms`);

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
			"> [Managers.game-loop] Warning:\n- FPS must be between 1 and 60, above 60 is acceptable but increases the amount of rendering unnecessarily.\n- The highest rendering speed is equal to your device's frame refresh rate"
		);
		return;
	}

	renderFPS = fps + 1;
	renderInterval = 1000 / renderFPS;
	console.log(`> [Managers.game-loop] Render FPS has been set to: ${fps}`);
}

function getFPSInfo() {
	console.log(`> [Managers.game-loop] Logic FPS: ${LOGIC_FPS} (fixed)`);
	console.log(`> [Managers.game-loop] Render FPS: ${renderFPS}`);
	return renderFPS;
}
