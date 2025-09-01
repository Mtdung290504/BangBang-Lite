/**
 * @typedef {import('../../network/assets_managers/assets-storage.js')} Storage
 * @typedef {{ id: string | undefined, emit: (...args: any[]) => void }} AbstractSocket
 */

// Models
import Player from '../../../../models/Player.js';

// Managers
import BattleInputManager from '../../core/managers/input/mgr.BattleInput.js';
import createCanvasManager from '../../core/managers/system/mgr.canvas.js';
import EntityManager from '../../core/managers/combat/mgr.Entity.js';
import * as gameLoopManager from '../../core/managers/system/mgr.game-loop.js';

// Systems
import CameraManager from '../../core/managers/graphic/mgr.Camera.js';

// Storage
import { storage } from '../../network/assets_managers/index.js';

// UIs
import * as battleView from '../../UIs/battleUI.js';
import { BufferedEmitter } from '../../network/helpers/net.BufferedEmitter.js';

const LOG_PREFIX = '> [initializer.Battle]';
const DEBUG_MODE = false;
const playerTankAndInput = new Map();

/**
 * Khởi tạo game, lưu ý nó không giải phóng view, phải thực hiện bên ngoài
 *
 * @param {AbstractSocket} socket
 * @param {number} mapID
 * @param {{ [socketID: string]: Player }} players
 */
export default function initBattle(socket, mapID, players) {
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
	console.log(msg('Canvas manager setup complete'), canvasManager);

	// Setup camera
	const { camera, cleanUpCameraEvent } = setupCamera(canvasManager, mapID);
	console.log(msg('Camera setup complete, waiting for target to track'), camera);

	// Setup emitter and player input
	const bufferedEmitter = new BufferedEmitter(socket, () => gameLoopManager.LOGIC_FPS);
	const playerInput = new BattleInputManager(bufferedEmitter, camera);
	playerInput.listen();
	console.log(msg('Player input setup complete'), playerInput);

	console.log(msg('Battle initiated successfully\n\n\n'));

	// Start game
	gameLoopManager.start(() => {
		gameLoopManager.setProgressLog(DEBUG_MODE);
		console.log(msg('Battle started, using context:'), context);
		// gameLoopManager.startLogicLoop(() => {});
		// gameLoopManager.startRenderLoop(() => {});
	});
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
	if (!mapManifest) throw new Error(msg('Map manifest is undefined???'));
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
