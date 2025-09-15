import type { Collider } from '../../../../src/core/physics/dsl.ColliderDeclaration';
import type { SpriteDeclaration } from '../../../../src/graphic/dsl.SpriteDeclaration';

import type { SkillEventHandler } from '../../../events/event-manifest';
import type { ValueWithUnit } from '../../value-with-unit';

/** Projectile enhancement: can track a target */
interface Tracking {
	name: 'tracking';
}

/** Projectile enhancement: can pierce targets */
interface Piercing {
	name: 'piercing';

	/** Unlimited by default */
	'hit-limit'?: number;

	/** Default: 0 */
	'damage-reduction'?: ValueWithUnit;
}

/** Projectile enhancement: can bounce between targets */
interface Bouncing {
	name: 'bouncing';
	'hit-limit': number;

	/** Default: 0 */
	'damage-reduction'?: ValueWithUnit;
}

/** Projectile enhancements union type */
type ProjectileEnhancement = Tracking | Piercing | Bouncing;

interface CreateProjectileOptions extends SpriteDeclaration, SkillEventHandler {
	name: string;

	/** Inherit from tank by default */
	'flight-range'?: number;

	/** Inherit from tank by default */
	'flight-speed'?: number;

	/** Sprite xuất hiện khi đánh trúng */
	'hit-effect-sprite'?: string;

	collider: Collider;
}

/**
 * Default shooting action with sprite key = `normal-attack`
 *
 * Note:
 * - flight-range: inherit
 * - flight-speed: inherit
 * - sprite-key: normal-attack
 * - on-hit: dealt normal-attack damage
 *
 */
interface CreateDefaultProjectile
	extends Omit<CreateProjectileOptions, 'flight-range' | 'flight-speed' | 'sprite-key' | 'on-hit'> {
	name: 'create-default-projectile';
	enhancements?: ProjectileEnhancement[];

	/**
	 * Tùy chọn vì mặc định đã là gây damage
	 * Bổ sung vào hành vi mặc định chứ không ghi đè
	 */
	'on-hit'?: SkillEventHandler['on-hit'];

	// Note:
	// flight-range: inherit
	// flight-speed: inherit
	// sprite-key: normal-attack
	// on-hit: dealt normal-attack damage
}

interface CreateCustomProjectile extends CreateProjectileOptions {
	name: 'create-custom-projectile';
	enhancements?: ProjectileEnhancement[];
}

export type CreateProjectileAction = CreateDefaultProjectile | CreateCustomProjectile;

// Usages

const defaultShoot: CreateDefaultProjectile = {
	name: 'create-default-projectile',
	collider: {
		type: 'rectangle',
		size: { width: 0, height: 0 },
	},
};
const customShoot: CreateCustomProjectile = {
	name: 'create-custom-projectile',
	'sprite-key': 's1',
	'flight-range': 600,
	'flight-speed': 15,
	'on-hit': {
		enemy: ['implement-later:'],
	},
	'on-dealt-damage': {
		self: ['implement-later:'],
	},
	enhancements: [
		{
			name: 'bouncing',
			'hit-limit': 3,
			'damage-reduction': { amount: 25 },
		},
	],

	collider: {
		type: 'rectangle',
		size: { width: 0, height: 0 },
	},
};
