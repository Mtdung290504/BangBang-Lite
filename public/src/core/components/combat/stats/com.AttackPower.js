export default class AttackPowerComponent {
	/**
	 * @param {'physical' | 'energy'} dmgType - Loại sát thương
	 * @param {number} value - Chỉ số công
	 * @param {number} penetration - Xuyên giáp
	 * @param {number} critDmg - Sát thương chí mạng (%), mặc định 200%
	 */
	constructor(dmgType, value, penetration, critDmg = 200) {
		/** Loại sát thương */
		this.dmgType = dmgType;

		/** Chỉ số công */
		this.value = value;

		/** Xuyên giáp */
		this.penetration = penetration;

		/** Sát thương chí mạng (%) */
		this.critDmg = critDmg;

		/** Tỉ lệ chí mạng mặc định mỗi tank có 3% */
		this.critRate = 3;
	}

	/**
	 * Khởi tạo AttackPowerComponent từ DSL.
	 * @param {import('.types/dsl/tank-manifest').AttackPowerStats} dsl - Dữ liệu DSL định nghĩa AttackPowerStats
	 */
	static fromDSL(dsl) {
		return new AttackPowerComponent(
			dsl['damage-type'],
			dsl['attack-power'],
			dsl['penetration'],
			dsl['crit-damage']
		);
	}
}
