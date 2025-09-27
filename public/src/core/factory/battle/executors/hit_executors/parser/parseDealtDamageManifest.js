import { INHERIT_DECLARATION } from '../../../../../../../configs/constants/domain_constants/fac.constants.js';

/**
 * @typedef {import('.types-system/dsl/skills/actions/apply_effect/dealt-damage').DealtDamage} DealtDamageManifest
 */

/**
 * @param {DealtDamageManifest} manifest
 *
 * Note: `damage-type` kế thừa từ thuộc tính của tank nếu không được khai báo
 */
export default function parseDealtDamageManifest(manifest) {
	const { action, source, value, 'damage-type': damageType, 'display-type': displayType = 'main' } = manifest;
	return { action, source, value, damageType: damageType ?? INHERIT_DECLARATION, displayType };
}
