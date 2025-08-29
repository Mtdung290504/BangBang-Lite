export default class SpeedComponent {
	/**
	 * @param {number} speed
	 * @param {number} [angle=0] - The direction of the movement in degrees.
	 */
	constructor(speed, angle = 0) {
		this.speed = speed;

		/**Unit: degree */
		this.angle = angle;
	}
}
