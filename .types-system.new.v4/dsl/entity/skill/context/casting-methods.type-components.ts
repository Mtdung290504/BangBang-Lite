/**
 * @description
 * - Mô tả skill được tung ra bằng cách nào để làm indicator
 * - Không chỉ thế, còn giới hạn bớt context mà các action có thể sử dụng
 */

import { LimitedDistance } from '../../../physic/range.type-components';

/**
 * Skill người chơi khóa mục tiêu (Ví dụ: Q mất máu)
 */
export interface TargetedCast extends LimitedDistance {
	type: 'on-target';
}

/** Skill chọn vùng tung ra (Ví dụ: R Magneto) */
export interface AreaCast extends LimitedDistance {
	type: 'at-area';

	/** Không tác động đến logic game, chỉ hiển thị vòng tròn có d = size chỉ định */
	display?: { size: number };
}

/** Skill theo hướng (Ví dụ: E TV)*/
export interface DirectionCast extends LimitedDistance {
	type: 'in-direction';

	/** Không tác động đến logic game, chỉ hiển thị mũi tên có width = size chỉ định */
	display?: { size: number };
}

export type CastingMethod = TargetedCast | AreaCast | DirectionCast;
