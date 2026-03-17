import { ValueWithUnit } from '../.types';

export interface LimitedDistance {
	/**
	 * Giới hạn khoảng cách bay / tầm hoạt động ngắn nhất.
	 * Nếu vượt quá sẽ bị hủy (hoặc kích hoạt logic On-End).
	 */
	'limit-range'?: number | string;
}
