import { RangeInheritAttribute } from '../movement/movement.enums';

/** Tính chất có giới hạn phạm vi */
export interface LimitedRange {
	'limit-range': number | RangeInheritAttribute;
}
