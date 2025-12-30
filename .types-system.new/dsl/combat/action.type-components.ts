import { ActionPrefix, ActionTargetingRequire, TargetingStrategyMap } from './action.enums';

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
 * Cấu hình cách chọn mục tiêu của kỹ năng
 * @template T - Chế độ nhắm mục tiêu
 */
export interface TargetingConfig<T extends ActionTargetingRequire> {
	targeting: {
		/**
		 * Chế độ chọn mục tiêu:
		 * - `none`: Skill có thể dùng từ bản thân mà không yêu cầu gì cả
		 * - `direction`: Cần chọn hướng chuột
		 * - `position`: Cần chọn vị trí trên bản đồ
		 * - `target`: Cần chọn mục tiêu cụ thể
		 */
		require: T;

		/** Cấu hình bổ sung, tùy vào mode, truy cập sâu vào type để xem chi tiết */
		strategy: TargetingStrategyMap[T];
	};
}
