import { ActionType, UseDirectionStrategy, UseTargetingStrategy } from './.components';
import { FlyingObjectProps } from '../../../combat/props.components';
import { Impactable, LimitedDuration } from '../../../combat/state.components';
import { Renderable } from '../../../combat/visual.components';
import { Collidable } from '../../../physic/collider.components';
import { StraightMovement } from '../../../physic/movement.components';
import { PositionDeclaration } from '../../../physic/position.enums';
import { LimitedDistance } from '../../../physic/range.components';

/**
 * 7. TẠO THỰC THỂ GÂY SÁT THƯƠNG / TƯƠNG TÁC (IMPACTOR / SENSOR)
 * Tích hợp đầy đủ các component Physic/Render/Logic.
 * Sử dụng CÓ CHỌN LỌC để tạo: Area Effect (Aura), Sensor Area, Bullet, Lazer.
 */
interface CreateImpactorBase<ActionBase>
	extends
		Impactable, // Mảng ActionBase lúc trúng mục tiêu (Thường là ApplyModifierAction)
		ActionType<'create-impactor'>,
		LimitedDuration, // Thời gian sống của Collider/Logic (Ví dụ: Bãi lửa sống 5s. Nếu đạn bay vĩnh viễn thì 'infinity')
		LimitedDistance, // Xóa sổ Entity khi bay mỏi cánh
		Renderable,      // Visual (Có 'on-parent-death' policy)
		Collidable,      // Collider Shape, impact-capacity (max hits), passthrough-targets (xuyên thấu)
		FlyingObjectProps {} // Đạn nảy

/**
 * Impactor CẦN HƯỚNG BẮN / VỊ TRÍ XUẤT PHÁT
 * (VD: Đạn bắn thẳng, Lazer, Bãi rác ném ra)
 */
export interface CreateImpactor<ActionBase>
	extends
		CreateImpactorBase<ActionBase>,
		UseDirectionStrategy,
		StraightMovement {
	/** Nơi xuất phát (Ví dụ: Từ họng súng, từ vị trí hiện tại...) */
	initPosition: PositionDeclaration;
}

/**
 * Impactor HIỆN THẲNG TRÊN MỤC TIÊU ĐÃ CHỌN
 * (VD: Trụ điện tự trúng đầu, cọc cắm dưới đất ngay chân mục tiêu)
 */
export interface CreateTargetedImpactor<ActionBase>
	extends CreateImpactorBase<ActionBase>, UseTargetingStrategy {
	/** KHÔNG CÓ POSITION, Mặc định sinh thẳng ở vị trí target / center of target */
}
