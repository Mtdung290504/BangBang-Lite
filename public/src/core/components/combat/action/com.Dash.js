export default class DashComponent {
	/**
	 * @param {number} angle Góc dash (độ)
	 * @param {object} options Cấu hình dash
	 * @param {number} options.speed Tốc độ dash (unit/s)
	 * @param {number} options.range Quãng đường tối đa
	 * @param {boolean} [options.throughWall=false] Có xuyên tường không
	 * @param {boolean} [options.throughPlayer=false] Có xuyên tank không
	 */
	constructor(angle, { speed, range, throughWall = false, throughPlayer = false }) {
		/** Góc dash (đơn vị: độ) */
		this.angle = angle;

		/** Tốc độ dash (unit/s) */
		this.speed = speed;

		/** Quãng đường còn lại của dash */
		this.remainingRange = range;

		/** Có xuyên tường không */
		this.throughWall = throughWall;

		/** Có xuyên player không */
		this.throughPlayer = throughPlayer;
	}

	/**
	 * Parse từ DSL sang options cho constructor.
	 * @param {import('.types-system/dsl/skill_actions/move/dash').Dash} dsl
	 */
	static parseDSL(dsl) {
		return {
			speed: dsl.speed,
			range: dsl.range,
			throughWall: dsl['through-wall'] ?? false,
			throughPlayer: dsl['through-tank'] ?? false,
		};
	}
}
