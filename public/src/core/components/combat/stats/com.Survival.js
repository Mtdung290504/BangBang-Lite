import {
	DEFAULT_DMG_REDUCTION,
	DEFAULT_DODGE_RATE,
	DEFAULT_HEALING_EFFECT,
} from '../../../../../configs/constants/domain_constants/com.constants.js';

export default class SurvivalComponent {
	/** In(De)creasing healing receive - Unit: % */
	healingEffect = DEFAULT_HEALING_EFFECT;

	/** Giảm sát thương nhận vào - Unit: % */
	dmgReduction = DEFAULT_DMG_REDUCTION;

	/** Tỉ lệ né tránh - Unit: % */
	dodgeRate = DEFAULT_DODGE_RATE;

	/**
	 * @param {number} limitHP - Lượng máu tối đa
	 * @param {number} armor - Giáp vật lý
	 * @param {number} shield - Khiên năng lượng
	 */
	constructor(limitHP, armor, shield) {
		/** Máu tối đa */
		this.limitHP = limitHP;

		/** Giáp vật lý */
		this.armor = armor;

		/** Khiên năng lượng */
		this.shield = shield;

		/**
		 * Máu hiện tại
		 * @private
		 */
		this._currentHP = limitHP;
	}

	/**
	 * Cập nhật máu hiện tại (tự động clamp trong [0, limitHP]).
	 * @param {number} value - Máu mới
	 */
	set currentHP(value) {
		this._currentHP = Math.max(0, Math.min(value, this.limitHP));
	}

	/** Máu hiện tại */
	get currentHP() {
		return this._currentHP;
	}

	/**
	 * Khởi tạo SurvivalComponent từ DSL.
	 * @param {import('.types-system/dsl/tank-manifest').SurvivalStats} dsl - Dữ liệu DSL định nghĩa SurvivalStats
	 */
	static fromDSL(dsl) {
		return new SurvivalComponent(dsl['limit-HP'], dsl['physical-armor'], dsl['energy-shield']);
	}
}
