import { RangeInheritAttribute } from './movement.enums';

export interface StraightMovement {
	'straight-movement': {
		/** Tốc độ bay (pixels/second), mặc định kế thừa từ tốc độ đạn bay của tank */
		speed?: number;
	};
}

/** Tính chất có giới hạn phạm vi */
export interface LimitedRange {
	'limit-range': number | RangeInheritAttribute;
}
