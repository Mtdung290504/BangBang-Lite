export default class NetworkPositionComponent {
	/**
	 * Component lưu vị trí được cập nhật từ mạng
	 */
	constructor() {
		/**@type {number | null} */
		this.x = null;

		/**@type {number | null} */
		this.y = null;
	}

	reset() {
		this.x = null;
		this.y = null;
	}
}
