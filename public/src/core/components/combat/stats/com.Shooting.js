import { PROJECTILE_SPEED_CALCULATION_CONSTANT } from '../../../../../configs/constants/domain_constants/com.constants.js';

export default class ShootingComponent {
	/**
	 * @param {number} fireRate - Tốc độ bắn (số đạn/phút)
	 * @param {number} range - Tầm bắn
	 * @param {number} flightSpeed - Vận tốc bay của đạn
	 */
	constructor(fireRate, range, flightSpeed) {
		/** Thời điểm bắn gần nhất (ms) */
		this.lastFireTime = 0;

		/** Khoảng cách giữa 2 phát bắn (ms) */
		this.fireRate = (60 / fireRate) * 1000;

		/** Tầm bắn */
		this.range = range;

		/** Vận tốc bay của đạn */
		this.flightSpeed = flightSpeed;
	}

	/**
	 * Khởi tạo ShootingComponent từ DSL.
	 * @param {import('.types-system/dsl/tank-manifest').ShootingStats} dsl - Dữ liệu DSL định nghĩa ShootingStats
	 */
	static fromDSL(dsl) {
		return new ShootingComponent(
			dsl['fire-rate'],
			dsl['fire-range'] * PROJECTILE_SPEED_CALCULATION_CONSTANT,
			dsl['flight-speed']
		);
	}
}
