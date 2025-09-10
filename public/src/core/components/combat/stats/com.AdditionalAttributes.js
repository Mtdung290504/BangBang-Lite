export default class AdditionalAttributesComponent {
	/** Hút máu (%), mặc định = 0 */
	lifeSteal = 0;

	/** Giảm hồi chiêu (%), mặc định = 0 */
	reduceCD = 0;

	/**
	 * @param {number} limitEnergyPoint - Giới hạn năng lượng
	 * @param {object} [recoverConfig] - Cấu hình hồi phục tự động
	 * @param {number} recoverConfig.every - Khoảng thời gian (ms) giữa mỗi lần hồi
	 * @param {import('.types-system/dsl/utils-types').ValueWithUnit} recoverConfig.amount - Lượng hồi mỗi lần
	 */
	constructor(limitEnergyPoint, recoverConfig) {
		/** @private */
		this._currentEnergyPoint = limitEnergyPoint;

		/** Giới hạn năng lượng */
		this.limitEnergyPoint = limitEnergyPoint;

		/** Cấu hình hồi năng lượng (nếu có) */
		this.recoverConfig = recoverConfig ?? null;
	}

	/**
	 * Thiết lập năng lượng hiện tại
	 * - Tự động giới hạn trong [0, limitEnergyPoint]
	 *
	 * @param {number} value - Giá trị năng lượng mới
	 */
	set currentEnergyPoint(value) {
		this._currentEnergyPoint = Math.max(0, Math.min(value, this.limitEnergyPoint));
	}

	/**
	 * Lấy năng lượng hiện tại
	 */
	get currentEnergyPoint() {
		return this._currentEnergyPoint;
	}

	/**
	 * Khởi tạo từ DSL
	 * @param {import('.types-system/dsl/tank-manifest').AdditionalStats} dsl
	 */
	static fromDSL(dsl) {
		const { amount, recover } = dsl['energy-point'];
		return new AdditionalAttributesComponent(amount, recover);
	}
}
