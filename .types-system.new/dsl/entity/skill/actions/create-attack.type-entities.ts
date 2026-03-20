import { ActionType, UseDirectionStrategy, UseTargetingStrategy } from './.type-components';
import { FlyingObjectProps } from '../../../combat/props.type-components';
import { Impactable, LimitedDuration } from '../../../combat/state.type-components';
import { Renderable } from '../../../combat/visual.type-components';
import { Collidable } from '../../../physic/collider.type-conponents';
import { Movable } from '../../../physic/movement.type-components';
import { RequireInitPositionMethod } from '../../../physic/position.type-components';
import { LimitedDistance } from '../../../physic/range.type-components';
import { StraightMovement } from '../../../physic/movement.types';
import { PositionDeclaration } from '../../../physic/position.enums';

interface CreateImpactorBase
	extends
		Impactable,
		ActionType<'create-entity'>,
		// Xét biến mất dựa trên khoảng cách nó đã bay, vậy thì tạo area effect sẽ không bị biến mất
		LimitedDistance,
		// Area effect tồn tại có thời hạn,
		// fly object tồn tại infinity, distance sẽ xóa nó khi bay hết hoặc bị collision hết giới hạn
		LimitedDuration,
		// TODO: Implement phải triển khai 2 điều kiện trước khi xóa impactor
		// 1. Collider của nó chết
		// 2. Sprite cấu hình `on-parent-death: wait-finish` đi hết thời gian được cấu hình
		Renderable,
		Collidable,
		FlyingObjectProps {}

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
			| PositionDeclaration.PARENT_HEAD
		>,
		Movable<StraightMovement> {}

/**
 * - Nếu create impactor handle nằm trong action ngoài cùng của skill sẽ bắt chọn target
 * - Nếu create trong ngữ cảnh con, dùng target đã khóa từ đầu? Không được.
 */
export interface CreateTargetedImpactor
	extends CreateImpactorBase, UseTargetingStrategy, RequireInitPositionMethod, Movable {}
