import BattleInputManager from '../managers/battle/mgr.BattleInput.js';

import { preloadPhase1, preloadPhase2 } from '../network/preloader.js';
import { storage } from '../network/assets_managers/index.js';

import { getSandboxPlayers } from '../network/socket/handlers/roomHandler.js';
import getSandboxSocket from '../network/socket/getSandboxSocket.js';

import __debugger from '../utils/debugger.js';
import { roomView } from '../UIs/roomUI.js';
import { CANVAS_ID, SANDBOX_PLAYER_NAME } from '../configs/constants/game-system-configs.js';
__debugger.listen();

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
	const players = getSandboxPlayers(SANDBOX_PLAYER_NAME, sandBoxSocket.id);

	const preloadPhase1Result = await preloadPhase1();
	const { sprites, mapAssets, tankManifests } = storage;
	if (!preloadPhase1Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}

	const preloadPhase2Result = await preloadPhase2(playingMapID, players);
	if (!preloadPhase2Result) {
		alert('Lỗi khi tải tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return;
	}
	clearRoomView();

	if (DEBUG_MODE) {
		__debugger.observe(players, { name: 'Players' });
		__debugger.observe(sprites, { name: 'Sprite storage' });
		__debugger.observe(mapAssets, { name: 'Map assets' });
		__debugger.observe(tankManifests, { name: 'Tank manifests' });
	}

	const inputMgr = setupInputManager(DEBUG_MODE);
	inputMgr.listen();

	setupBattle();
	// __debugger.hideAll();
}

function setupInputManager(debug = false) {
	const inputMgr = new BattleInputManager();
	if (debug) __debugger.observe(inputMgr, { name: 'Input manager' });
	return inputMgr;
}

function setupBattle() {
	// TODO: Setup battle
}

function clearRoomView() {
	// Clear room view, display canvas
	roomView.container.remove();
	document.getElementById(CANVAS_ID).style = undefined;
}
