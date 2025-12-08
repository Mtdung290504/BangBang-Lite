import { RangeInheritAttribute } from './range.enums';

/** Tính chất có giới hạn phạm vi */
export interface LimitedDistance {
	'limit-range': number | RangeInheritAttribute;
}
