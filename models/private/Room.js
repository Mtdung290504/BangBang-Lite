import Player from '../public/Player.js';

export default class Room {
	constructor() {
		/** @type {{[socketID: string]: Player}} */
		this.players = {};

		/** @type {[Set<string>, Set<string>]} */
		this.teams = [new Set(), new Set()];

		/** @type {Set<string>} */
		this.readyPlayers = new Set();

		/** @type {Set<string>} */
		this.loadedPlayers = new Set();

		this.playingMap = 0;
	}
}
