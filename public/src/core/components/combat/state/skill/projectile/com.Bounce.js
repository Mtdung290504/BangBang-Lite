export default class BounceComponent {
	/**@type {number?} */
	currentTargetEID = null;

	/**
	 * @param {number} hitLimit
	 * @param {number} bounceRange
	 * @param {Readonly<import('.types-system/dsl/skills/value-with-unit').ValueWithUnit>} damageModifier
	 */
	constructor(hitLimit, bounceRange, damageModifier) {
		this.hitRemaining = hitLimit;
		this.bounceRange = bounceRange;
		this.damageModifier = damageModifier;
	}

	/**
	 * @param {import('.types-system/dsl/skills/actions/create_attack/create-projectile').Bouncing} dsl
	 */
	static fromDSL(dsl) {
		return new BounceComponent(dsl['hit-limit'], dsl['bounce-range'], dsl['damage-modifier'] ?? { amount: 0 });
	}
}
