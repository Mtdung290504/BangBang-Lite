/**
 * @typedef {import('../network/assets_managers/assets-storage.js')} Storage
 * @typedef {{ id: string | undefined, emit: (...args: any[]) => void }} AbstractSocket
 */

import Player from '../../../models/Player.js';
import EntityManager from '../core/managers/battle/mgr.Entity.js';
import createCanvasManager from '../core/managers/system/mgr.canvas.js';
import { storage } from '../network/assets_managers/index.js';
import * as battleView from '../UIs/battleUI.js';

/**
 * @param {AbstractSocket} socket
 * @param {{ [socketID: string]: Player }} players
 */
export function initBattle(socket, players) {
	const canvasManager = setupCanvas(battleView.views.canvas);
	const { context: context2D } = canvasManager;
	const context = new EntityManager();
}

/**
 * @param {HTMLCanvasElement} canvas
 */
function setupCanvas(canvas) {
	return createCanvasManager(canvas, { resolution: 1080 });
}
