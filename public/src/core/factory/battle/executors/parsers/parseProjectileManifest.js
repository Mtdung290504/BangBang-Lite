import { INHERIT_DECLARATION } from '../../../../../../configs/constants/domain_constants/fac.constants.js';

/**
 * @typedef {import('.types-system/dsl/skills/actions/create_attack/create-projectile').CreateProjectileAction} CreateProjectileAction
 */

/**
 * @param {CreateProjectileAction} manifest
 *
 * Notes:
 * - `renderSize` của projectile mặc định kế thừa từ collider của nó
 * - `flightRange` của projectile mặc định kế thừa từ tầm bắn của tank
 * - `flightSpeed` của projectile mặc định kế thừa từ tốc độ đạn bay của tank
 * - `spriteKey` của projectile mặc định là `normal-attack`
 */
export default function parseProjectileManifest(manifest) {
	const { collider, action, enhancements = [] } = manifest;

	return {
		name: action,
		collider: collider,
		enhancements: enhancements,

		onDealtDamage: manifest['on-dealt-damage'],
		onHit: manifest['on-hit'],
		hitEffectSprite: manifest['hit-effect-sprite'],

		renderSize: manifest['render-size'] ?? INHERIT_DECLARATION,
		flightRange: manifest['flight-range'] ?? INHERIT_DECLARATION,
		flightSpeed: manifest['flight-speed'] ?? INHERIT_DECLARATION,
		spriteKey: manifest['sprite-key'] ?? 'normal-attack',
	};
}
