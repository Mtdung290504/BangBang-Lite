export default class PierceComponent {
	/**
	 * @param {number} limit
	 * @param {import('.types-system/dsl/skills/value-with-unit').ValueWithUnit} damageReduction
	 */
	constructor(limit, damageReduction) {
		this.limit = limit;
		this.damageReduction = damageReduction;
	}

	/**
	 * @param {import('.types-system/dsl/skills/actions/create_attack/create-projectile').Piercing} dsl
	 */
	static fromDSL(dsl) {
		return new PierceComponent(dsl['hit-limit'] ?? Infinity, {
			// Clone to avoid editing references
			...(dsl['damage-reduction'] ?? { amount: 0 }),
		});
	}
}
