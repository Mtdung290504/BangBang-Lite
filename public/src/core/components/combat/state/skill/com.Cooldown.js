export default class SkillCooldownComponent {
	/**
	 * @param {number} cooldownValue - Thời gian CD (đơn vị: s)
	 */
	constructor(cooldownValue) {
		this.CD = cooldownValue * 1000;

		/** Timestamp của lần cuối tung chiêu, chỉ bằng 0 khi reset */
		this.lastUsedTime = 0;
	}

	/**
	 * Lấy thời gian hồi chiêu còn lại của skill để hiển thị.
	 * @returns Thời gian hồi chiêu còn lại (đơn vị: s, làm tròn 2 chữ số thập phân).
	 */
	get remainingCD() {
		// `lastUsedTime` ở trạng thái reset, trả về 0
		if (this.lastUsedTime === 0) return 0;

		/** Thời gian đã trôi qua kể từ lần cuối dùng skill (đơn vị: ms) */
		const timePassed = Date.now() - this.lastUsedTime;

		/** Thời gian hồi chiêu còn lại (đơn vị: ms) */
		const remaining = (this.CD - timePassed) / 1000;

		// Giới hạn dưới thành 0 để tránh lỗi hiển thị
		return Math.max(parseFloat(remaining.toFixed(2)), 0);
	}

	activateCD() {
		this.lastUsedTime = Date.now();
	}

	resetCD() {
		this.lastUsedTime = 0;
	}

	/**
	 * Giảm hồi chiêu
	 * @param {import('.types-system/dsl/skills/value-with-unit.js').ValueWithUnit} valueWithUnit
	 */
	reduceCD(valueWithUnit) {
		const { amount, unit } = valueWithUnit;

		if (!unit || unit === 'unit') this._reduceCooldownBySecond(amount);
		else if (unit === '%') this._reduceCooldownByPercentage(amount);
	}

	/**
	 * Giảm thời gian hồi chiêu của skill theo đơn vị phần trăm.
	 *
	 * @private
	 * @param {number} percentage - Phần trăm cần giảm.
	 */
	_reduceCooldownByPercentage(percentage) {
		const amountInSeconds = (this.CD / 1000) * (percentage / 100);
		this._reduceCooldownBySecond(amountInSeconds);
	}

	/**
	 * Giảm thời gian hồi chiêu của skill theo đơn vị giây.
	 *
	 * @private
	 * @param {number} amount - Thời gian cần giảm (đơn vị: s)
	 */
	_reduceCooldownBySecond(amount) {
		/** Thời gian hồi chiêu còn lại (đơn vị: ms) */
		const remainingCooldown = this.remainingCD * 1000;

		// Thời gian hồi chiêu còn lại đã là 0 thì không cần xử lý nữa
		if (remainingCooldown === 0) {
			// Reset `lastUsedTime` để tối ưu lấy remaining CD cho lần sau
			return this.resetCD();
		}

		/**
		 * Khoảng thời gian cần giảm (đơn vị: ms)
		 * *Không cần giới hạn giảm vì `remainingCD` đã làm
		 */
		const reduceAmount = amount * 1000;

		// Cập nhật thời gian lần cuối sử dụng, lùi nó về quá khứ để giảm thời gian hồi chiêu
		this.lastUsedTime -= reduceAmount;
	}
}
