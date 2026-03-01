import { ActionType, UseDirectionStrategy, UseTargetingStrategy } from './.type-components';
import { FlyingObjectProps } from '../../../combat/props.type-components';
import { Impactable } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';
import { StraightMovement } from '../../../physic/movement.types';
import { PositionDeclaration } from '../../../physic/position.enums';

interface CreateImpactorBase
	extends Impactable, ActionType<'create-entity'>, LimitedDistance, Renderable, Collidable, FlyingObjectProps {}

/**
 * Note: Nếu muốn apply effect lên mình thì cần tạo hitbox mang effect lên mình tại chỗ
 */
export interface CreateImpactor
	extends
		CreateImpactorBase,
		UseDirectionStrategy,
		RequireInitPositionMethod<
			| PositionDeclaration.MOUSE_POS
			| PositionDeclaration.SELF_POS
			| PositionDeclaration.SELF_HEAD
			| PositionDeclaration.TARGET_POS
			| PositionDeclaration.PARENT_POS
		>,
		Movable<StraightMovement> {}

export interface CreateTargetedImpactor
	extends CreateImpactorBase, UseTargetingStrategy, RequireInitPositionMethod, Movable {}
