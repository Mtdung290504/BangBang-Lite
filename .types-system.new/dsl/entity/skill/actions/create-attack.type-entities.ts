import { ActionType, TargetingConfig } from '../../../combat/action.type-components';
import { IgnoreArchitecture, Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

import { SkillCastAction, SkillHitAction } from './.type-pack';

export interface CreateImpactor
	extends ActionType<'create-entity'>,
		TargetingConfig<'direction'>,
		RequireInitPositionMethod,
		LimitedDistance,
		Renderable,
		Impactable<SkillHitAction, SkillCastAction>,
		IgnoreArchitecture,
		Collidable,
		Movable {}

// Example
const skill_1: CreateImpactor = {
	action: '@create-entity',
	targeting: { require: 'direction', strategy: null },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': { value: 'inherit:fire-range' },
	movement: { 'move-type': 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: { shape: 'circle', size: { radius: 20 } },
	'break-on-impact': true,

	visual: { sprite: { key: 'normal-attack' } },
	'on-impact': [
		{
			'target-effect': {
				action: '@apply-effect:modify-stat',
				'value-from': {
					attribute: 'lost-energy-point',
					of: 'self',
					value: { amount: 10, unit: '%' },
				},
			},
		},
	],
};
