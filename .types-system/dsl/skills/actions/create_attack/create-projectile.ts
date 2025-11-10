import type { Collider } from '../../../../src/core/physics/dsl.ColliderDeclaration';
import type { SpriteDeclaration } from '../../../../src/graphic/dsl.SpriteDeclaration';

import type { SkillEventHandler } from '../../../events/event-manifest';
import type { ValueWithUnit } from '../../value-with-unit';

import type { ActionDeclaration } from '../base-action';

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
	'damage-modifier'?: ValueWithUnit;
}

/** Projectile enhancement: can bounce between targets */
interface Bouncing {
	name: 'bouncing';
	'hit-limit': number;
	'bounce-range': number;

	/** Default: 0 */
	'damage-modifier'?: ValueWithUnit;
}

/** Projectile enhancements union type */
type ProjectileEnhancement = Tracking | Piercing | Bouncing;

interface CreateProjectileBased extends ActionDeclaration {
	action: '@create:projectile';

	/** Inherit from tank by default */
	'flight-range'?: number;

	/** Inherit from tank by default */
	'flight-speed'?: number;

	/** Sprite xuất hiện khi đánh trúng */
	'hit-effect-sprite'?: string;

	collider: Collider;

	enhancements?: ProjectileEnhancement[];

	/** Độ lệch so với hướng bắn (Đơn vị: deg), mặc định là 0 */
	'delta-angle'?: number;
}

/**
 * - *Mặc định với projectile, nếu không có `render-size` trong manifest thì nó sẽ được lấy từ `collider`*
 * - Với type là custom, phải truyền vào 'on-hit' và 'sprite-key'
 */
type CreateProjectileAction = CreateProjectileBased &
	(
		| (SkillEventHandler &
				SpriteDeclaration & {
					type: 'custom';
					targets?: readonly (keyof SkillEventHandler['on-hit'])[];
				})
		| (Partial<SkillEventHandler> & Partial<SpriteDeclaration> & { type: 'default' })
	);

export type { CreateProjectileAction, Tracking, Piercing, Bouncing };

// Usages

const defaultShoot: CreateProjectileAction = {
	action: '@create:projectile',
	type: 'default',
	collider: { type: 'rectangle', size: { width: 0, height: 0 } },
};

const customShoot: CreateProjectileAction = {
	action: '@create:projectile',
	type: 'custom',

	'sprite-key': 's1',
	'flight-range': 600,
	'flight-speed': 15,

	collider: {
		type: 'rectangle',
		size: { width: 0, height: 0 },
	},

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
			'bounce-range': 300,
			'damage-modifier': { amount: 25 },
		},
	],
};
