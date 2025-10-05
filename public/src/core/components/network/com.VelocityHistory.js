export default class VelocityHistoryComponent {
	/**
	 * Component lưu lại lịch sử thay đổi vị trí với timestamp
	 */
	constructor() {
		/**
		 * Lịch sử các delta movement với timestamp
		 * @type {Array<{timestamp: number, dx: number, dy: number}>}
		 */
		this.deltaHistory = [];
	}

	/**
	 * Thêm delta movement vào lịch sử
	 *
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} timestamp
	 */
	saveDelta(dx, dy, timestamp) {
		if (dx === 0 && dy === 0) return;
		this.deltaHistory.push({ timestamp, dx, dy });

		// Giữ lại tối đa 500ms lịch sử để tránh memory leak
		const cutoff = timestamp - 500;
		this.deltaHistory = this.deltaHistory.filter((delta) => delta.timestamp > cutoff);
	}
}
