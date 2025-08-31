/**
 * @typedef {import('../network/assets_managers/assets-storage.js')} Storage
 * @typedef {{ id: string | undefined, emit: (...args: any[]) => void }} AbstractSocket
 */

// Models
import Player from '../../../models/Player.js';

// Managers
import BattleInputManager from '../core/managers/battle/mgr.BattleInput.js';
import createCanvasManager from '../core/managers/system/mgr.canvas.js';
import EntityManager from '../core/managers/battle/mgr.Entity.js';

// Systems
import CameraSystem from '../core/systems/combat/sys.Camera.js';

// Storage
import { storage } from '../network/assets_managers/index.js';

// UIs
import * as battleView from '../UIs/battleUI.js';

const LOG_PREFIX = '> [initializer.Battle]';

/**
 * @param {AbstractSocket} socket
 * @param {number} mapID
 * @param {{ [socketID: string]: Player }} players
 */
export function initBattle(socket, mapID, players) {
	console.log('\n\n> [initializer.Battle] Battle initializing...');
	const context = new EntityManager();

	// Setup canvas với auto resize
	const canvasManager = createCanvasManager(battleView.views.canvas, { resolution: 1080, autoResize: true });
	const { context: context2D, canvas } = canvasManager;

	// Setup camera
	const { camera, cleanUpCameraEvent } = setupCamera(canvasManager, mapID);
	console.log(msg('Camera setup complete, waiting for target to track'), camera);

	// Setup player input
	const playerInput = setupPlayerInputHandler(socket, camera);
	playerInput.listen();
	console.log(msg('Player input setup complete'), playerInput);

	console.log(msg('Battle initiated successfully\n\n\n'));
}

/**
 * @param {AbstractSocket} socket
 * @param {CameraSystem} camera - Camera để chuẩn hóa tọa độ chuột screen về tọa độ game
 */
function setupPlayerInputHandler(socket, camera) {
	const inputHandler = new BattleInputManager(socket, (mouseState) => {
		const { canvas, viewportX, viewportY } = camera;
		const { left, top } = canvas.getBoundingClientRect();
		let { mouseX: lastMouseX, mouseY: lastMouseY } = mouseState;

		mouseState.mouseX = lastMouseX - left + viewportX;
		mouseState.mouseY = lastMouseY - top + viewportY;
	});

	return inputHandler;
}

/**
 * @param {ReturnType<typeof createCanvasManager>} canvasManager
 * @param {number} mapID - Để lấy map size
 */
function setupCamera(canvasManager, mapID) {
	const { canvas } = canvasManager;
	const camera = new CameraSystem(canvas);

	// Lấy map manifest để lấy map size
	const mapManifest = storage.getMapManifest(mapID);
	if (!mapManifest) throw new Error('> [Battle.setupCamera] Map manifest is undefined???');
	const { width: mapWidth, height: mapHeight } = mapManifest.size;

	// Đặt map size cho camera
	camera.setMapSize(mapWidth, mapHeight);
	camera.update();

	// Event listeners: Chặn hành vi mặc định của scroll, context menu
	const signalController = new AbortController();
	window.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: signalController.signal });
	window.addEventListener('scroll', (e) => e.preventDefault(), { signal: signalController.signal });
	window.addEventListener('resize', () => camera.update(), { signal: signalController.signal });

	return {
		camera,
		cleanUpCameraEvent() {
			signalController.abort();
		},
	};
}

/**
 * @param {string} text
 */
function msg(text) {
	return `${LOG_PREFIX} ${text}`;
}
