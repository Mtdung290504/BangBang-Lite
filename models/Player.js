export default class Player {
	/**
	 * @param {string} socketID
	 * @param {string} name
	 * @param {0 | 1} team
	 * @param {{
	 * 		tankID?: number
	 * 		skinID?: number
	 * 		avatarID?: number
	 * }} using
	 */
	constructor(socketID, name, team, using = {}) {
		this.socketID = socketID;
		this.name = name;
		this.team = team;
		this.using = {
			tankID: (using.tankID ??= 0),
			skinID: (using.skinID ??= 0),
			avatarID: (using.avatarID ??= 0),
		};
	}

	/**
	 * @param {Object} param0
	 * @param {string} param0.socketID
	 * @param {string} param0.name
	 * @param {0 | 1} param0.team
	 * @param {{
	 * 		tankID?: number
	 * 		skinID?: number
	 * 		avatarID?: number
	 * }} param0.using
	 */
	static fromJSON({ socketID, name, team, using }) {
		return new Player(socketID, name, team, using);
	}
}
