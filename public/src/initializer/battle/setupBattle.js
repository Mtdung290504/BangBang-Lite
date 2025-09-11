/**
 * @typedef {import('../../network/assets_managers/assets-storage.js')} _Storage
 * @typedef {{ id: string | undefined, emit: (...args: any[]) => void }} _AbstractSocket
 * @typedef {import('../../core/components/network/com.NetworkPosition.js').default} _NetworkPosition
 */

// Models
import Player from '../../../../models/public/Player.js';

// Network
import { storage } from '../../network/assets_managers/index.js';
import { BufferedEmitter } from '../../network/helpers/net.BufferedEmitter.js';

// Managers
import BattleInputManager from '../../core/managers/input/mgr.BattleInput.js';
import createCanvasManager from '../../core/managers/system/mgr.canvas.js';
import EntityManager from '../../core/managers/combat/mgr.Entity.js';
import CameraManager from '../../core/managers/graphic/mgr.Camera.js';
import * as gameLoopManager from '../../core/managers/system/mgr.game-loop.js';

// UIs
import * as battleView from '../../UIs/battleUI.js';

// Factories
import createTank from '../../core/factory/battle/fac.createTank.js';

// Setup system manager
import setupLogicSystems from './setupLogicSystems.js';
import setupRenderSystems from './setupRenderSystems.js';

// Position component to camera follow
import PositionComponent from '../../core/components/physics/com.Position.js';

const LOG_PREFIX = '> [initializer.Battle]';
const DEBUG_MODE = false;

/** @type {Map<string, { tankEID: number, inputManager: BattleInputManager, networkPosition: _NetworkPosition }>} */
const playerRegistry = new Map();

/**
 * Khởi tạo game, lưu ý nó không giải phóng view, phải thực hiện việc đó bên ngoài
 *
 * @param {_AbstractSocket} socket
 * @param {number} mapID
 * @param {{ [socketID: string]: Player }} players
 * @param {true} [sandbox]
 */
export default function setupBattle(socket, mapID, players, sandbox) {
	console.log('\n\n> [initializer.Battle] Battle initializing...');
	const context = new EntityManager();

	const selfSocketID = socket.id;
	if (!selfSocketID) throw new Error(msg('Self socket ID is undefined???'));

	// Setup canvas, đặt auto resize
	const canvasManager = createCanvasManager(battleView.views.canvas, { resolution: 'screen', autoResize: true });
	const { context: context2D, canvas } = canvasManager;
	const { width: cw, height: ch } = canvas;
	console.log(msg('Canvas manager setup complete'), canvasManager);

	// Setup camera
	const { camera, cleanUpCameraEvent } = setupCamera(canvasManager, mapID);
	console.log(msg('Camera setup complete, waiting for target to track'), camera);

	// Setup emitter và player input
	// const bufferedEmitter = new BufferedEmitter(socket, () => gameLoopManager.LOGIC_FPS);
	// const selfLocalInputManager = new BattleInputManager(bufferedEmitter, camera);
	const selfLocalInputManager = new BattleInputManager(socket, camera).listen();
	const selfInputManager = new BattleInputManager();
	const usingInputManager = sandbox ? selfLocalInputManager : selfInputManager;
	console.log(msg('Player input setup complete'), usingInputManager);

	// Setup tanks và lưu thông tin và registry. Có thể trong tương lai dùng để sync trạng thái
	const selfTankEID = setupTanks(context, mapID, players, {
		selfSocketID,
		selfInputManager: usingInputManager,
	});

	// Camera theo dõi player theo mặc định
	camera.follow(context.getComponent(selfTankEID, PositionComponent));
	console.log(msg('Battle initiated successfully\n\n\n'));

	// Setup các system
	const logicSysManager = setupLogicSystems(context);
	const renderSysManager = setupRenderSystems(context, context2D, mapID, () => DEBUG_MODE);

	/**
	 * Start battle sau khi setup socket listener
	 */
	function start() {
		gameLoopManager.setProgressLog(DEBUG_MODE);
		gameLoopManager.start(() => {
			console.log('\n\n', msg('Battle started, using context:'), context);

			gameLoopManager.startLogicLoop(() => {
				// Update toàn bộ logic và di chuyển camera
				logicSysManager.updateAll();
				camera.update();
			});

			gameLoopManager.startRenderLoop(() => {
				// Clear canvas
				context2D.clearRect(0, 0, cw, ch);
				context2D.save();

				// Di chuyển đến vị trí cần render và render toàn bộ
				context2D.translate(...camera.getTranslate());
				renderSysManager.renderAll();

				context2D.restore();
			});
		});
	}

	return { context, start, playerRegistry };
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

	// Đặt map size cho camera, update lần đầu tiên
	camera.setMapSize(mapWidth, mapHeight);
	camera.update(); // (thực chất không quá quan trọng vì game loop luôn cập nhật camera)

	// Event listeners: Chặn hành vi mặc định của scroll, context menu
	const signalController = new AbortController();
	window.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: signalController.signal });
	window.addEventListener('scroll', (e) => e.preventDefault(), { signal: signalController.signal });
	window.addEventListener('resize', () => camera.setSize(canvas.width, canvas.height), {
		signal: signalController.signal,
	});

	return { camera, cleanUpCameraEvent: () => signalController.abort() };
}

/**
 * @param {EntityManager} context
 * @param {number} mapID
 * @param {{ [socketID: string]: Player }} players
 * @param {Object} self
 * @param {string} self.selfSocketID
 * @param {BattleInputManager} self.selfInputManager
 */
function setupTanks(context, mapID, players, { selfSocketID, selfInputManager }) {
	const selfTeam = players[selfSocketID].team;

	// Khởi tạo tank cho các player khác
	const anotherPlayerSocket = Object.keys(players).filter((socketID) => socketID !== selfSocketID);
	anotherPlayerSocket.forEach((socketID) => {
		const player = players[socketID];
		const faction = player.team !== selfTeam ? 'enemy' : 'ally';

		playerRegistry.set(socketID, createTank(context, mapID, player, faction));
	});

	// Khởi tạo tank cho mình
	// Khởi tạo cho bản thân sau là có lý do, render tank của bản thân sẽ luôn hiện trên các tank khác (trừ khi nó bay)
	const { tankEID, networkPosition } = createTank(context, mapID, players[selfSocketID], 'self', selfInputManager);
	playerRegistry.set(selfSocketID, { tankEID, inputManager: selfInputManager, networkPosition });

	return tankEID;
}

/**
 * @param {string} text
 */
function msg(text) {
	return `${LOG_PREFIX} ${text}`;
}
