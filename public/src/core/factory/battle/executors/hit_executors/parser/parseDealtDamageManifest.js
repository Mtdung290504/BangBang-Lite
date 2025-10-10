import { INHERIT_DECLARATION } from '../../../../../../../configs/constants/domain_constants/parser.constants.js';

/**
 * @typedef {import('.types-system/dsl/skills/actions/apply_effect/dealt-damage').DealtDamage} DealtDamageManifest
 */

/**
 * @param {DealtDamageManifest} manifest
 *
 * Note: `damage-type` kế thừa từ thuộc tính của tank nếu không được khai báo
 */
export default function parseDealtDamageManifest(manifest) {
	const {
		action,
		source,
		value,
		'damage-type': damageType,
		'display-type': displayType = 'main',
		'is-main-damage': isMainDamage = false,
	} = manifest;

	return { action, source, value, damageType: damageType ?? INHERIT_DECLARATION, displayType, isMainDamage };
}
