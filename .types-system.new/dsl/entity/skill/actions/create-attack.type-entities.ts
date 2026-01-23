import { ActionType, TargetingConfig } from '../../../combat/action.type-components';
import { Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

// Cicular depend
import { SkillCastAction, SkillHitAction } from './.type-pack';

interface CreateImpactor
	extends
		Impactable<SkillHitAction, SkillCastAction>,
		ActionType<'create-entity'>,
		TargetingConfig,
		LimitedDistance,
		Renderable,
		Collidable,
		Movable {}

export interface CreateNonContextImpactor
	extends CreateImpactor, RequireInitPositionMethod<'mouse-pos' | 'self-pos' | 'target-pos'> {}

export interface CreateContextImpactor extends CreateImpactor, RequireInitPositionMethod {}

// Example
const skill_1: CreateNonContextImpactor = {
	action: '@create-entity',
	targeting: { require: 'direction' },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': '100%',
	movement: { 'move-type': 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: {
		shape: { type: 'circle', size: { radius: 20 } },
		pierce: ['architecture'],
	},

	visual: { sprite: { key: 'normal-attack' } },

	impact: {
		// dispose: true,
		actions: [
			{
				'target-effect': {
					action: '@apply-effect:modify-stat',
					'value-from': { attribute: 'lost-energy-point', of: 'self', value: '10%' },
				},
			},
		],
		visual: { sprite: { key: 'normal-attack-impact' } },
	},
};
