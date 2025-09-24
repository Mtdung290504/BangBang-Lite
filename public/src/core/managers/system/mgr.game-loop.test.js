import { createTickEngine } from './APIs/tick-engine.js';

// Flags
let paused = true;
let progressLog = false;

// FPS control
export const LOGIC_FPS = 60;
let renderFPS = 60;
let lastRenderTime = 0;

// Lưu trữ để không phải thực hiện phép chia nhiều lần trong render loop
let renderInterval = 1000 / renderFPS;
setRenderFPS(renderFPS);

// Tick Engine instance
export const tickEngine = createTickEngine({ enableLogging: false });

/**
 * @param {() => void} runner
 */
export function start(runner) {
	paused = false;
	runner();
}

export function stop() {
	paused = true;
	// Stop logic ticker when paused
	tickEngine.stopTicker('gameLogic');
}

/**
 * @param {boolean} value
 */
export function setProgressLog(value) {
	progressLog = value;
}

/**
 * @param {() => void} updater
 */
export function startLogicLoop(updater) {
	// Remove existing logic ticker if any
	try {
		tickEngine.removeTicker('game-loop');
	} catch (error) {
		// Ticker doesn't exist, ignore
	}

	// Add logic ticker using tick engine
	tickEngine.addTicker(
		{
			name: 'game-loop',
			fps: LOGIC_FPS,
			autoStart: false,
		},
		(event) => {
			if (paused) return;
			progressLog && console.log('> [mgr.game-loop]: Logic is updating...');

			try {
				updater();
			} catch (error) {
				stop();
				console.error('> [mgr.game-loop] Game loop stopped due to error, see error log above');
			}
		}
	);

	// Start logic ticker if not paused
	if (!paused) {
		tickEngine.startTicker('game-loop');
	}
}

/**
 * @param {() => void} renderer
 */
export function startRenderLoop(renderer) {
	/**
	 * @param {DOMHighResTimeStamp} currentTime
	 */
	function renderFrame(currentTime) {
		if (paused) return;

		// Kiểm tra đủ thời gian theo render FPS mới gọi hàm render frame tiếp theo
		// 1000 / fps = delta time (đơn vị: ms)
		// if (currentTime - lastRenderTime >= renderInterval) {
		// 	progressLog && console.log('> [mgr.game-loop]: Drawing...');
		// 	renderer();
		// 	lastRenderTime = currentTime;
		// }
		renderer();
		requestAnimationFrame(renderFrame);
	}

	requestAnimationFrame(renderFrame);
}

/**
 * @param {number} fps
 */
export function setRenderFPS(fps) {
	if (fps <= 0) {
		console.warn(
			"> [mgr.game-loop] Warning:\n- FPS must be between 10 and 60, above 60 is acceptable but increases the amount of rendering unnecessarily.\n- The highest rendering speed is equal to your device's frame refresh rate"
		);
		return;
	}

	fps = Math.max(10, fps);
	renderFPS = fps + 5;
	renderInterval = 1000 / renderFPS;
	console.log(`> [mgr.game-loop] Render FPS has been set to: ${fps}`);
}

export function getFPSInfo() {
	console.log(`> [mgr.game-loop.getFPSInfo] Logic FPS: ${LOGIC_FPS} (fixed)`);
	console.log(`> [mgr.game-loop.getFPSInfo] Render FPS: ${renderFPS}`);
	return renderFPS;
}
