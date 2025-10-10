export default class PierceComponent {
	/**
	 * @param {number} hitLimit
	 * @param {Readonly<import('.types-system/dsl/skills/value-with-unit').ValueWithUnit>} damageModifier
	 */
	constructor(hitLimit, damageModifier) {
		this.hitTimes = 0;
		this.hitLimit = hitLimit;
		this.damageModifier = damageModifier;
	}

	/**
	 * @param {import('.types-system/dsl/skills/actions/create_attack/create-projectile').Piercing} dsl
	 */
	static fromDSL(dsl) {
		return new PierceComponent(
			// Default is Infinity
			dsl['hit-limit'] ?? Infinity,

			// Clone to avoid editing references
			dsl['damage-modifier'] ?? { amount: 0 }
		);
	}
}
