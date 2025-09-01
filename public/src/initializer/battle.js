/**
 * @typedef {import('../network/assets_managers/assets-storage.js')} Storage
 * @typedef {{ id: string | undefined, emit: (...args: any[]) => void }} AbstractSocket
 */

// Models
import Player from '../../../models/Player.js';

// Managers
import BattleInputManager from '../core/managers/input/mgr.BattleInput.js';
import createCanvasManager from '../core/managers/system/mgr.canvas.js';
import EntityManager from '../core/managers/combat/mgr.Entity.js';
import * as gameLoopManager from '../core/managers/system/mgr.game-loop.js';

// Systems
import CameraManager from '../core/managers/graphic/mgr.Camera.js';

// Storage
import { storage } from '../network/assets_managers/index.js';

// UIs
import * as battleView from '../UIs/battleUI.js';

const LOG_PREFIX = '> [initializer.Battle]';
const playerTankAndInput = new Map();

/**
 * @param {AbstractSocket} socket
 * @param {number} mapID
 * @param {{ [socketID: string]: Player }} players
 */
export function initBattle(socket, mapID, players) {
	console.log('\n\n> [initializer.Battle] Battle initializing...');
	const context = new EntityManager();

	const selfSocketID = socket.id;
	if (!selfSocketID) throw new Error(msg('Self socket ID is undefined???'));

	// Setup map
	for (const socketID in players)
		if (!playerTankAndInput.has(socketID)) playerTankAndInput.set(socketID, { tank: undefined, input: undefined });

	// Setup canvas với auto resize
	const canvasManager = createCanvasManager(battleView.views.canvas, { resolution: 'screen', autoResize: true });
	const { context: context2D } = canvasManager;

	// Setup camera
	const { camera, cleanUpCameraEvent } = setupCamera(canvasManager, mapID);
	console.log(msg('Camera setup complete, waiting for target to track'), camera);

	// Setup player input
	const playerInput = setupPlayerInputHandler(socket, camera);
	playerInput.listen();
	camera.setMouseState(playerInput.mouseState); // Đặt mouse state vào camera system để chuẩn hóa tọa độ mỗi frame
	console.log(msg('Player input setup complete'), playerInput);

	console.log(msg('Battle initiated successfully\n\n\n'));

	// Start game
	gameLoopManager.start(() => {
		console.log(msg('Battle started'));
		// gameLoopManager.startLogicLoop(() => {});
		// gameLoopManager.startRenderLoop(() => {});
	});
}

/**
 * @param {AbstractSocket} socket
 * @param {CameraManager} camera - Camera để chuẩn hóa tọa độ chuột screen về tọa độ game
 */
function setupPlayerInputHandler(socket, camera) {
	// Note: tọa độ chuột chỉ được chuẩn hóa khi mouse move, vì vậy khi camera di chuyển thì tọa độ chuột sẽ bị lệch
	// Note: đã fix bằng cách thêm hàm `normalizeMouseState` vào CameraSystem
	const inputHandler = new BattleInputManager(socket, (mouseState) => {
		const { canvas, viewportX, viewportY } = camera;
		const { left, top } = canvas.getBoundingClientRect();
		let { x: lastMouseX, y: lastMouseY } = mouseState;

		mouseState.x = lastMouseX - left + viewportX;
		mouseState.y = lastMouseY - top + viewportY;
	});

	return inputHandler;
}

/**
 * @param {ReturnType<typeof createCanvasManager>} canvasManager
 * @param {number} mapID - Để lấy map size
 */
function setupCamera(canvasManager, mapID) {
	const { canvas } = canvasManager;
	const camera = new CameraManager(canvas);

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

	return { camera, cleanUpCameraEvent: () => signalController.abort() };
}

/**
 * @param {string} text
 */
function msg(text) {
	return `${LOG_PREFIX} ${text}`;
}
