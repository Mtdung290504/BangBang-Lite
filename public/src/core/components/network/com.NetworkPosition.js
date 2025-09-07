export default class NetworkPositionComponent {
	/**
	 * Component lưu vị trí được cập nhật từ mạng
	 */
	constructor() {
		/**@type {number | null} */
		this.x = null;

		/**@type {number | null} */
		this.y = null;

		/**@type {number | null} */
		this.targetX = null;

		/**@type {number | null} */
		this.targetY = null;
	}

	reset() {
		this.x = null;
		this.y = null;
	}

	resetTarget() {
		this.targetX = null;
		this.targetY = null;
	}
}
