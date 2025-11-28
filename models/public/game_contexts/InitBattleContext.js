export default class InitBattleContext {
	/**
	 * @param {*} selfSocket
	 * @param {*} mapID
	 * @param {*} players
	 */
	constructor(selfSocket, mapID, players) {
		this.selfSocket = selfSocket;
		this.mapID = mapID;
		this.players = players;
	}
}
