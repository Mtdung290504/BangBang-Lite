export default class StatsHistoryComponent {
	/**
	 * Lịch sử các delta HP với timestamp
	 * @type {{ timestamp: number, deltaHP: number }[]}
	 */
	deltaHPs = [];

	/**
	 * Lịch sử các delta energy với timestamp
	 * @type {{ timestamp: number, deltaEnergy: number }[]}
	 */
	deltaEnergys = [];

	/**
	 * @param {number} deltaHP
	 * @param {number} timestamp
	 */
	saveDeltaHP(deltaHP, timestamp) {
		this.deltaHPs.push({ deltaHP, timestamp });

		// Giữ lại tối đa 500ms lịch sử để tránh memory leak
		const cutoff = timestamp - 500;
		this.deltaHPs = this.deltaHPs.filter((delta) => delta.timestamp > cutoff);
	}

	/**
	 * @param {number} deltaEnergy
	 * @param {number} timestamp
	 */
	saveDeltaEnery(deltaEnergy, timestamp) {
		this.deltaEnergys.push({ deltaEnergy, timestamp });

		// Giữ lại tối đa 500ms lịch sử để tránh memory leak
		const cutoff = timestamp - 500;
		this.deltaEnergys = this.deltaEnergys.filter((delta) => delta.timestamp > cutoff);
	}
}
