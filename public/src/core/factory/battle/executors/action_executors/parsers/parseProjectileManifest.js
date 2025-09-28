import {
	DEFAULT_HIT_HANDLER,
	INHERIT_DECLARATION,
} from '../../../../../../../configs/constants/domain_constants/parser.constants.js';

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
 * - Nếu `type` là `default`, bổ sung hành vi gây (100% x Tấn Công) mặc định vào manifest
 */
export default function parseProjectileManifest(manifest) {
	const { collider, action, type, enhancements = [], 'on-hit': onHit, 'on-dealt-damage': onDealtDamage } = manifest;

	const parseHitManifest = () => {
		if (type === 'default') {
			return onHit
				? {
						ally: onHit?.ally,
						enemy: onHit?.enemy ? [...onHit.enemy, DEFAULT_HIT_HANDLER] : [DEFAULT_HIT_HANDLER],
						self: onHit?.self,
				  }
				: { enemy: [DEFAULT_HIT_HANDLER] };
		} else if (type === 'custom') {
			// Nếu định nghĩa on hit là undefined hoặc tồn tại nhưng thiếu tất cả thuộc tính sẽ throw lỗi
			if (!onHit || Object.keys(onHit).length === 0) {
				console.error(`> [parser.parseProjectileManifest] Invalid on hit manifest for type::[custom]:`, onHit);
				throw new Error(`> [parser.parseProjectileManifest] Invalid on hit manifest for type::[custom]`);
			}
			return onHit;
		} else throw new Error(`> [parser.parseProjectileManifest] Invalid projectile type::[${type}]`);
	};

	const parseDealtDamageManifest = () => {
		if (!onDealtDamage) return undefined;
		if (Object.keys(onDealtDamage).length === 0) return undefined;
		return onDealtDamage;
	};

	return {
		action,
		collider,
		enhancements,

		onHit: parseHitManifest(),
		onDealtDamage: parseDealtDamageManifest(),

		hitEffectSprite: manifest['hit-effect-sprite'],
		renderSize: manifest['render-size'] ?? INHERIT_DECLARATION,
		flightRange: manifest['flight-range'] ?? INHERIT_DECLARATION,
		flightSpeed: manifest['flight-speed'] ?? INHERIT_DECLARATION,
		spriteKey: manifest['sprite-key'] ?? 'normal-attack',
	};
}
