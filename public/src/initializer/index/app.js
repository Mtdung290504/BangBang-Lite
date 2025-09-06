// Socket
import getConnectedSocket from '../../network/socket/getConnectedSocket.js';

// Assets
import { preloadPhase1, preloadPhase2 } from '../../network/preloader.js';
import { storage } from '../../network/assets_managers/index.js';

// Room
import { battleHandlers, roomHandlers } from '../../network/socket/handlers/index.js';

// UIs
import * as roomView from '../../UIs/roomUI.js';
import * as battleView from '../../UIs/battleUI.js';

// Config & debugs
import __debugger from '../../../utils/debugger.js';
__debugger.listen();

// Initializer
import setupBattle from '../battle/setup.js';
import { LOGIC_FPS } from '../../core/managers/system/mgr.game-loop.js';
import PositionComponent from '../../core/components/physics/com.Position.js';

const DEBUG_MODE = true;

/**
 * - Request join room
 * - Preload phase 1
 * - Khi tất cả trong room sẵn sàng:
 * 	- Preload phase 2
 * 	- Giải phóng room UI (Trong tương lai sẽ giữ lại nhưng trước mắt làm vậy cho nhanh)
 * 	- Tải xong phase 2 emit lên server
 * 	- Khi nhận event all loaded thì khởi tạo game
 *
 * @param {string} roomID
 * @param {string} playerName
 * @param {'host' | 'client'} role
 */
export async function init(roomID, playerName, role) {
	// Preload phase 1 for lobby
	const preloadPhase1Result = await preloadPhase1();
	const { sprites, mapAssets, mapManifests, tankManifests } = storage;
	if (!preloadPhase1Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	// Setup socket & join room
	const socket = await setupSocket(DEBUG_MODE);
	socket.emit('request:join-room', roomID, { playerName, role });

	// Listen for all-player-ready event to preload
	// *Đăng ký sự kiện sau nên đọc dữ liệu từ roomHandler thay vì socket data
	socket.on('dispatch:all-player-ready', async () => {
		roomView.destroy();

		const { playingMapID: mapID, players } = roomHandlers;
		await preloadPhase2(mapID, Object.values(players));

		console.log('> [App] Setup view and Start battle initializer...');
		battleView.setup();

		// TODO: Setup and start battle
		const battle = setupBattle(socket, mapID, players);
		const detroyBattleHandler = battleHandlers.setup(socket, battle.playerRegistry);

		// Setup sync system
		if (role === 'host') {
			const { context, playerRegistry } = battle;
			setInterval(() => {
				/**@type {{[socketID: string]: PositionComponent }} */
				const positionStates = {};
				for (const [socketID, { tankEID }] of playerRegistry)
					positionStates[socketID] = context.getComponent(tankEID, PositionComponent);

				battleHandlers.syncPositionState(socket, positionStates);
			}, LOGIC_FPS);
		}

		// Thông báo tải xong và đợi tất cả tải xong, timeout 10s
		socket.emit('dispatch:loaded');
		socket.once('dispatch:all-player-loaded', () => battle.start());

		if (DEBUG_MODE) {
			__debugger.observe(players, { name: 'Players' });
			__debugger.hideAll();
		}
	});

	if (DEBUG_MODE) {
		__debugger.observe(sprites, { name: 'Sprite storage' });
		__debugger.observe(mapAssets, { name: 'Map assets' });
		__debugger.observe(mapManifests, { name: 'Map Manifests' });
		__debugger.observe(tankManifests, { name: 'Tank Manifests' });
		__debugger.hideAll();
	}

	roomView.setup(roomID, socket);
}

async function setupSocket(debug = false) {
	try {
		const socket = await getConnectedSocket();
		roomHandlers.setup(socket);

		if (debug) __debugger.observe(socket, { name: 'Socket' });

		return socket;
	} catch (error) {
		alert('Lỗi khi kết nối đến server, cần tải lại trang hoặc thử vào lại sau!');
		throw error;
	}
}
