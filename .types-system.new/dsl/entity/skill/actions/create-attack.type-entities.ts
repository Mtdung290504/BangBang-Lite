import { ActionType, UseDirectionStrategy, UseUseTargetingStrategy } from './.type-components';
import { Bounceable, Pursuitable } from '../../../combat/props.type-components';
import { Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';

interface CreateImpactor
	extends Impactable, ActionType<'create-entity'>, LimitedDistance, Renderable, Collidable, Movable, Bounceable {}

/**
 * Note: Nếu muốn apply effect lên mình thì cần tạo hitbox mang effect lên mình tại chỗ
 */
export interface CreateNonContextImpactor
	extends CreateImpactor, UseDirectionStrategy, RequireInitPositionMethod<'mouse-pos' | 'self-pos' | 'target-pos'> {}

export interface CreateContextImpactor
	extends CreateImpactor, UseUseTargetingStrategy, RequireInitPositionMethod, Pursuitable {}
