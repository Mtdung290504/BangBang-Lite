export class PositionComponent {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [z=1] - The zoom-like elevation, used for effects like jump or throw up. Defaults to 1.
	 */
	constructor(x, y, z = 1) {
		this.x = x;
		this.y = y;
		this.z = z;

		// Vị trí bắt đầu (Dùng để hồi sinh)
		this.initX = x;
		this.initY = y;
	}
}
