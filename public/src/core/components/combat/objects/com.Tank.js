export default class TankComponent {
	/**
	 * @param {number} tankID
	 * @param {number} skinID
	 */
	constructor(tankID, skinID) {
		this.tankID = tankID;
		this.skinID = skinID;
		this.tankHeadEID = -1;
	}
}
