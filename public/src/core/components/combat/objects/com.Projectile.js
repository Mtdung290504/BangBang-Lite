export default class ProjectileComponent {
	traveledDistance = 0;
	cleanable = false;

	/**
	 * @param {number} flightRange
	 */
	constructor(flightRange) {
		this.flightRange = flightRange;
	}

	get outOfRange() {
		return this.traveledDistance >= this.flightRange;
	}
}
