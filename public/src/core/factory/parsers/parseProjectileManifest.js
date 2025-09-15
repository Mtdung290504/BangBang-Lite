import { INHERIT_DECLARATION } from '../../../../configs/constants/domain_constants/fac.constants.js';

/**
 * - Có thể xem là class mô tả 1 projectile để factory khởi tạo được parse từ DSL
 *
 * - `renderSize` của projectile mặc định kế thừa từ collider của nó
 * - `flightRange` của projectile mặc định kế thừa từ tầm bắn của tank
 * - `flightSpeed` của projectile mặc định kế thừa từ tốc độ đạn bay của tank
 * - `spriteKey` của projectile mặc định là `normal-attack`
 */
class ParsedProjectileManifest {
	/**
	 * @param {import('.types-system/dsl/skills/actions/create_attack/create-projectile').CreateProjectileAction} manifest
	 */
	constructor(manifest) {
		const { collider, action, enhancements = [] } = manifest;

		this.name = action;
		this.collider = collider;
		this.enhancements = enhancements;

		this.onDealtDamage = manifest['on-dealt-damage'];
		this.onHit = manifest['on-hit'];
		this.hitEffectSprite = manifest['hit-effect-sprite'];

		this.renderSize = manifest['render-size'] ?? INHERIT_DECLARATION;
		this.flightRange = manifest['flight-range'] ?? INHERIT_DECLARATION;
		this.flightSpeed = manifest['flight-speed'] ?? INHERIT_DECLARATION;
		this.spriteKey = manifest['sprite-key'] ?? 'normal-attack';
	}
}

/**
 * @param {import('.types-system/dsl/skills/actions/create_attack/create-projectile').CreateProjectileAction} manifest
 */
export default function parseProjectileManifest(manifest) {
	// return new ParsedProjectileManifest(manifest);
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
