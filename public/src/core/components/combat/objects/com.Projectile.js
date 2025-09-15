export default class ProjectileComponent {
	traveledDistance = 0;

	/**
	 * @param {number} ownerEID
	 * @param {number} flightRange
	 */
	constructor(ownerEID, flightRange) {
		this.ownerEID = ownerEID;
		this.flightRange = flightRange;
	}

	get outOfRange() {
		return this.traveledDistance >= this.flightRange;
	}
}
