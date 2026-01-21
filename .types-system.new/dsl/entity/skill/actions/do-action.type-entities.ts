import { ActionType } from '../../../combat/action.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';

export interface ChangePhase extends ActionType<'do-action', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${number}`;
}
