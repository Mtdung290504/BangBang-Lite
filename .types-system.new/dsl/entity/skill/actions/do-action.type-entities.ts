import { ActionType } from '../../../combat/action.type-components';
import { IgnoreArchitecture, Impactable, LimitedDuration } from '../../../combat/state.type-components';
import { Movable } from '../../../physic/movement.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

import { SkillCastAction, SkillHitAction } from './.type-pack';

export interface ChangePhase extends ActionType<'do-action', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${number}`;
}

export interface Dash
	extends ActionType<'do-action', 'dash'>,
		LimitedDistance,
		Movable,
		Impactable<SkillHitAction, SkillCastAction>,
		IgnoreArchitecture {}
