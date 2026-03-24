import { ValueWithUnit } from '../.types';
import { RangeEnum } from './range.enums';

/** Tính chất có giới hạn phạm vi */
export interface LimitedDistance {
	/**
	 * - Với đơn vị là %, nó sẽ lấy `tầm bắn tank` * `% khai báo` / 100
	 * - Mặc định không khai báo sẽ kế thừa tầm đánh của tank, tức: `'100%'`
	 * - **Note**: Cẩn thận xử lý giá trị 0 và giá trị âm
	 */
	'limit-range'?: ValueWithUnit<true, RangeEnum | (number & {})>;
}

// Phạm vi 1000
const e1: LimitedDistance = { 'limit-range': '1000u +*1.5/s' };
