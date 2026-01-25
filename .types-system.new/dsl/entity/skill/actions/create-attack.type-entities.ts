import { ActionType, TargetingConfig } from '../../../combat/action.type-components';
import { Bounceable, Pursuitable } from '../../../combat/props.type-components';
import { Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

// Cicular depend
import { SkillCastAction, SkillHitAction } from './.types';

interface CreateImpactor
	extends
		Impactable<SkillHitAction, SkillCastAction | SkillHitAction>,
		ActionType<'create-entity'>,
		TargetingConfig,
		LimitedDistance,
		Renderable,
		Collidable,
		Movable,
		Bounceable {}

/**
 * Note: Nếu muốn apply effect lên mình thì cần tạo hitbox mang effect lên mình tại chỗ
 */
export interface CreateNonContextImpactor
	extends CreateImpactor, RequireInitPositionMethod<'mouse-pos' | 'self-pos' | 'target-pos'> {}

export interface CreateContextImpactor extends CreateImpactor, RequireInitPositionMethod, Pursuitable {}
