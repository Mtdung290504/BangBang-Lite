/**
 * @typedef {import('.types-system/dsl/skills/actions/apply_effect/recover-hp').RecoverHP} RecoverHPManifest
 */

/**
 * @param {RecoverHPManifest} manifest
 *
 * Note: `damage-type` kế thừa từ thuộc tính của tank nếu không được khai báo
 */
export default function parseRecoverHPManifest(manifest) {
	const { action, source, value, 'display-type': displayType = 'main' } = manifest;
	return { action, source, value, displayType };
}
