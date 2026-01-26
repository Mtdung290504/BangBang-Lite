import { RandomDefinition } from '../.enums';
import {
	ActionPrefix,
	// ActionTargetingRequire,
	LockMethod,
} from './action.enums';
// import { TargetingStrategyMap } from './action.types';

/**
 * Khai báo action mà system cần thực hiện, chẳng hạn như:
 * - Gắn component vào mục tiêu nào đó (tạo effect/gây damage/...)
 * - Tạo ra entity mới (tạo đạn/area-damage/...)
 * - Hay hành vi đặc thù gì đó (lướt/nhảy/... dự phòng vì chưa biết tạo entity mới hay gắn component)
 */
export interface ActionType<Action extends ActionPrefix, Type extends string = ''> {
	/** Format: `@{action}` */
	action: `@${Action}${Type extends '' ? '' : `:${Type}`}`;
}

/**
 * Note:
 * - Tạm không dùng. Nhận thấy skill chỉ có 2 loại chính là bay theo hướng và require target.
 * - Còn none hay position, direction thực ra luôn tồn tại và lấy được trong ngữ cảnh game khi player tung chiêu.
 * - Chỉ có target là trường hợp đặc biệt nếu không có thì không thể tung chiêu được.
 *
 * Cấu hình cách chọn mục tiêu của kỹ năng
 * @template T - Chế độ nhắm mục tiêu
 */
// export interface TargetingConfig<T extends ActionTargetingRequire = ActionTargetingRequire> {
// 	targeting: {
// 		/**
// 		 * Chế độ chọn mục tiêu:
// 		 * - `none`: Skill có thể dùng từ bản thân mà không yêu cầu gì cả
// 		 * - `direction`: Cần chọn hướng chuột
// 		 * - `position`: Cần chọn vị trí trên bản đồ
// 		 * - `target`: Cần chọn mục tiêu cụ thể
// 		 */
// 		require: T;

// 		/** Cấu hình bổ sung, tùy vào mode, truy cập sâu vào type để xem chi tiết */
// 		strategy?: TargetingStrategyMap[T];
// 	};
// }

interface UseStrategy<T extends string> {
	strategy?: { type: T } & Record<string, any>;
}

export interface UseDirectionStrategy extends UseStrategy<'direction'> {
	/**
	 * Mặc định là `{ type: 'direction' }`
	 */
	strategy?: {
		type: 'direction';

		/**
		 * Góc (đơn vị: deg) được cộng vào hướng đã chọn
		 * @default 0
		 */
		'delta-angle'?: number | RandomDefinition;
	};
}

export interface UseUseTargetingStrategy extends UseStrategy<'targeting'> {
	strategy: {
		type: 'targeting';

		/**
		 * - `active-lock`: Lấy (các) mục tiêu trong phạm vi bán kính 25px quanh trỏ chuột
		 * - `nearest`: Lấy (các) mục tiêu gần nhất
		 * - `random`: Lấy (các) mục tiêu ngẫu nhiên
		 * - `weakest`: Lấy (các) mục tiêu thấp máu nhất
		 *
		 * @default 'active-lock'
		 */
		method?: LockMethod;

		/**
		 * Quy định số mục tiêu tối đa bị khóa
		 * @default 1
		 */
		'limit-target'?: boolean;
	};
}
