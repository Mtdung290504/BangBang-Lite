import { preloadPhase1, preloadPhase2 } from '../../network/preloader.js';
import { storage } from '../../network/assets_managers/index.js';

import { SANDBOX_PLAYER_NAME } from '../../../configs/constants/game-system-configs.js';
import { getSandboxPlayers } from '../../network/socket/handlers/roomHandler.js';
import getSandboxSocket from '../../network/socket/getSandboxSocket.js';

import __debugger from '../../../utils/debugger.js';
__debugger.listen();

import * as battleView from '../../UIs/battleUI.js';
import * as roomView from '../../UIs/roomUI.js';
import setupBattle from '../battle/setup.js';

const DEBUG_MODE = true;

/**
 * @param {number | string} [playingMapID=0]
 * @param {number | string} [usingTankID=1]
 * @returns {Promise<void>}
 */
export async function init(usingTankID = 1, playingMapID = 0) {
	usingTankID = Number(usingTankID);
	playingMapID = Number(playingMapID);

	const sandBoxSocket = getSandboxSocket();
	const players = getSandboxPlayers(SANDBOX_PLAYER_NAME, usingTankID);

	const preloadPhase1Result = await preloadPhase1();
	const { sprites, mapAssets, tankManifests, mapManifests } = storage;
	if (!preloadPhase1Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	// Trong room thật, chỉ preload phase 2 khi vào trận
	const preloadPhase2Result = await preloadPhase2(playingMapID, Object.values(players));
	if (!preloadPhase2Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	// TODO: setup battle
	roomView.destroy();
	battleView.setup();
	const battle = setupBattle(sandBoxSocket, playingMapID, players);

	// TODO: Setup socket listener with battle.playerRegistry and start battle
	setupSocketListener(battle.playerRegistry);
	battle.start();

	// Create debuggers
	if (DEBUG_MODE) {
		__debugger.observe(players, { name: 'Players' });
		__debugger.observe(sprites, { name: 'Sprite storage' });
		__debugger.observe(mapAssets, { name: 'Map assets' });
		__debugger.observe(tankManifests, { name: 'Tank manifests' });
		__debugger.observe(mapManifests, { name: 'Map manifests' });
		__debugger.observe(battle.context, { name: 'Entity Manager (Context)' });
		__debugger.hideAll();
	}
}

/**
 * @param {ReturnType<typeof setupBattle>['playerRegistry']} playerRegistry
 */
function setupSocketListener(playerRegistry) {
	// TODO: Setup socket listener in real app
	console.log('> [Sandbox] Simulate socket listener setup using:', playerRegistry);
}
