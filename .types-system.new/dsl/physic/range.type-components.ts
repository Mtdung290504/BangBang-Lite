import { ValueWithUnit } from '../.types';
import { RangeEnum } from './range.enums';

/** Tính chất có giới hạn phạm vi */
export interface LimitedDistance {
	/**
	 * - Với đơn vị là %, nó sẽ lấy `tầm bắn tank` * `% khai báo` / 100
	 * - Mặc định không khai báo sẽ kế thừa tầm đánh của tank, tức: `{ amount: 100, unit: '%' }`
	 * - **Note**: Cẩn thận xử lý giá trị 0 và giá trị âm
	 */
	'limit-range'?: ValueWithUnit<RangeEnum | (number & {})>;
}

// Phạm vi 1000
const e1: LimitedDistance = {
	'limit-range': { amount: 1000 },
};
