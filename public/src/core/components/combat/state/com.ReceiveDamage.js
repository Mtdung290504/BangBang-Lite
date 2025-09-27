export default class ReceiveDamageComponent {
	/**
	 *
	 * @param {number} sourceEID
	 * @param {import('.types-system/dsl/enums/damage-types').DamageType} damageType
	 * @param {number} damageValue
	 * @param {NonNullable<import('../../../factory/battle/executors/hit_executors/parser/parseDealtDamageManifest.js').DealtDamageManifest['display-type']>} displayType
	 */
	constructor(sourceEID, damageType, damageValue, displayType) {
		this.sourceEID = sourceEID;
		this.damageType = damageType;
		this.damageValue = damageValue;
		this.displayType = displayType;
	}
}
