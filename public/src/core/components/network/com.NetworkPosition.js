export default class NetworkPositionComponent {
	/**
	 * Component lưu vị trí được cập nhật từ mạng với timestamp
	 */
	constructor() {
		/**@type {number | null} */
		this.x = null;

		/**@type {number | null} */
		this.y = null;

		/**@type {number | null} */
		this.timestamp = null;

		/**@type {number | null} */
		this.targetX = null;

		/**@type {number | null} */
		this.targetY = null;
	}

	/**
	 * Set vị trí và timestamp từ network
	 * @param {number} x - Vị trí X từ network
	 * @param {number} y - Vị trí Y từ network
	 * @param {number} timestamp - Timestamp của network data
	 */
	setNetworkPosition(x, y, timestamp) {
		this.x = x;
		this.y = y;
		this.timestamp = timestamp;
	}

	/**
	 * Reset network position data
	 */
	reset() {
		this.x = null;
		this.y = null;
		this.timestamp = null;
	}

	/**
	 * Reset target position cho lerp
	 */
	resetTarget() {
		this.targetX = null;
		this.targetY = null;
	}
}
