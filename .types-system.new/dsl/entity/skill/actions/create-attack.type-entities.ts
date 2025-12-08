import { ActionType, TargetingConfig } from '../../../combat/action.type-components';
import { Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

import { SkillCastAction, SkillHitAction } from './.type-pack';

/** Kỹ năng tạo đạn (projectile) */
export interface CreateProjectile
	extends ActionType<'create'>,
		RequireInitPositionMethod<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'direction'>,
		LimitedDistance,
		Renderable,
		Collidable,
		Impactable<SkillHitAction, SkillCastAction>,
		Movable {}

// Example
const skill_1: CreateProjectile = {
	action: '@create',
	targeting: { require: 'direction', strategy: null },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': 'inherit:fire-range',
	movement: { type: 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: { shape: 'circle', size: { radius: 20 } },
	'dispose-on-impact': true,

	visual: { sprite: { key: 'normal-attack' } },
	'on-impact': [{ 'target-effect': { action: '@apply:modify-energy', value: {} } }],
};
