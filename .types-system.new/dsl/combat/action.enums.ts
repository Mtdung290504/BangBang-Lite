import { RandomDefinition } from '../.enums';
import { TypedRecord } from '../.types';

/**
 * Các action prefix:
 *
 * - `create`: Tạo ra gì đó, ví dụ: đạn, area damage (chém bán nguyệt, vùng ST,...),...
 * - `do`: Các hành vi cơ học như lướt, nhảy,...
 * - `apply`: Gây ST, hồi máu, gây hiệu ứng,... Nói chung là các effect gây ra khi skill trúng đích
 */
export type ActionPrefix = 'create' | 'do' | 'apply';

/**
 * Khai báo action skill cần loại thông tin tổng quát gì:
 *
 * - `none`: Không cần thông tin gì
 * - `direction`: Cần biết hướng chuột (ví dụ: bắn đạn, lướt,...)
 * - `position`: Cần biết vị trí chuột (ví dụ: cast area, dịch chuyển,...)
 * - `target`: Cần khóa mục tiêu cụ thể (ví dụ: skill khóa mục tiêu)
 */
export type ActionTargetingRequire = 'none' | 'direction' | 'position' | 'target';

/**
 * Map ActionTargetingRequire đến cấu hình chiến thuật phù hợp
 */
export type TargetingStrategyMap = TypedRecord<
	ActionTargetingRequire,
	any,
	{
		/** Nếu không có, mặc định là 0 */
		direction: {
			/** Góc delta (đơn vị: deg) được cộng vào hướng đã chọn */
			'delta-angle': number | RandomDefinition;
		} | null;

		/** Nếu không chỉ định chiến thuật này, mặc định đơn mục tiêu, chọn bằng trỏ chuột */
		target: {
			/**
			 * - `lock`: Lấy (các) mục tiêu trong phạm vi bán kính 25px quanh trỏ chuột
			 * - `nearest`: Lấy (các) mục tiêu gần nhất
			 * - `random`: Lấy (các) mục tiêu ngẫu nhiên
			 * - `weakest`: Lấy (các) mục tiêu thấp máu nhất
			 *
			 * **Mặc định**: `lock`
			 */
			method?: 'lock' | 'nearest' | 'weakest' | RandomDefinition;

			/** Quy định số mục tiêu tối đa bị khóa, mặc định: 1 */
			'limit-target'?: boolean;
		} | null;

		none: null;
		position: null;
	}
>;
