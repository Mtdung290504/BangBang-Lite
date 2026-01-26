import { RandomDefinition } from '../.enums';
import { TypedRecord } from '../.types';
// import { ActionTargetingRequire, LockMethod } from './action.enums';

/**
 * Map ActionTargetingRequire đến cấu hình chiến thuật phù hợp
 */
// export type TargetingStrategyMap = TypedRecord<
// 	ActionTargetingRequire,
// 	any,
// 	{
// 		/** Nếu không có, mặc định là 0 */
// 		direction: {
// 			/** Góc delta (đơn vị: deg) được cộng vào hướng đã chọn */
// 			'delta-angle': number | RandomDefinition;
// 		};

// 		/** Nếu không chỉ định chiến thuật này, mặc định đơn mục tiêu, chọn bằng trỏ chuột */
// 		target: {
// 			/**
// 			 * - `active-lock`: Lấy (các) mục tiêu trong phạm vi bán kính 25px quanh trỏ chuột
// 			 * - `nearest`: Lấy (các) mục tiêu gần nhất
// 			 * - `random`: Lấy (các) mục tiêu ngẫu nhiên
// 			 * - `weakest`: Lấy (các) mục tiêu thấp máu nhất
// 			 *
// 			 * **Mặc định**: `active-lock`
// 			 */
// 			method?: LockMethod;

// 			/** Quy định số mục tiêu tối đa bị khóa, mặc định: 1 */
// 			'limit-target'?: boolean;
// 		};

// 		none: never;
// 		position: never;
// 	}
// >;
