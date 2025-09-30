/**
 * @typedef {Object} DamageReceived
 * @property {number} sourceEID
 * @property {import('.types-system/dsl/enums/damage-types').DamageType} damageType
 * @property {number} damageValue
 * @property {NonNullable<import('../../../factory/battle/executors/hit_executors/parser/parseDealtDamageManifest.js').DealtDamageManifest['display-type']>} displayType
 */

export default class ReceivedDamageComponent {
	/** @type {DamageReceived[]} */
	damageQueue = [];
}
