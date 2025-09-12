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

		/**
		 * Timestamp của lần sync cuối cùng
		 * @type {number | null}
		 */
		this.lastSyncTimestamp = null;
	}

	/**
	 * Thêm delta movement vào lịch sử
	 *
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} timestamp
	 */
	saveDelta(dx, dy, timestamp) {
		this.deltaHistory.push({ timestamp, dx, dy });

		// Giữ lại chỉ 300ms lịch sử để tránh memory leak
		const cutoff = timestamp - 300;
		this.deltaHistory = this.deltaHistory.filter((delta) => delta.timestamp > cutoff);
	}

	/**
	 * Lấy tổng delta từ một timestamp cụ thể
	 * @param {number} fromTimestamp
	 */
	getDeltaFromTimestamp(fromTimestamp) {
		let totalDx = 0;
		let totalDy = 0;

		for (const delta of this.deltaHistory) {
			if (delta.timestamp > fromTimestamp) {
				totalDx += delta.dx;
				totalDy += delta.dy;
			}
		}

		return { dx: totalDx, dy: totalDy };
	}

	/**
	 * Tìm timestamp gần nhất với target timestamp
	 * @param {number} targetTimestamp
	 */
	findNearestTimestamp(targetTimestamp) {
		if (this.deltaHistory.length === 0) return null;

		let nearest = this.deltaHistory[0];
		let minDiff = Math.abs(nearest.timestamp - targetTimestamp);

		for (const delta of this.deltaHistory) {
			const diff = Math.abs(delta.timestamp - targetTimestamp);
			if (diff < minDiff) {
				minDiff = diff;
				nearest = delta;
			}
		}

		return nearest.timestamp;
	}

	/**
	 * Clear lịch sử từ một timestamp
	 * @param {number} fromTimestamp
	 */
	clearFromTimestamp(fromTimestamp) {
		this.deltaHistory = this.deltaHistory.filter((delta) => delta.timestamp <= fromTimestamp);
	}
}
