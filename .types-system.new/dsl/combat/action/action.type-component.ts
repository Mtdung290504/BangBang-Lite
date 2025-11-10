import { ActionPrefix } from './action.enums';
import { ActionTargetMap } from './action.types';

/** Khai báo action thực hiện */
export interface ActionDeclaration<Action extends ActionPrefix, Name extends ActionTargetMap[Action]> {
	/** Format: @{action}:{target} */
	action: `@${Action}:${Name}`;
}

/**
 * Cấu hình cách chọn mục tiêu của kỹ năng
 * @template T - Chế độ nhắm mục tiêu
 */
export interface TargetingConfig<T extends 'self' | 'direction' | 'position' | 'target' | 'auto'> {
	targeting: {
		/**
		 * Chế độ chọn mục tiêu:
		 * - `self`: Tác động lên bản thân
		 * - `direction`: Chọn hướng chuột
		 * - `position`: Chọn vị trí trên bản đồ
		 * - `target`: Click chọn mục tiêu cụ thể
		 * - `auto`: Hệ thống tự chọn theo strategy
		 */
		mode: T;

		/**
		 * Chiến lược tự động (chỉ khi mode='auto'):
		 * - `nearest`: Chọn mục tiêu gần nhất
		 * - `random`: Chọn ngẫu nhiên trong phạm vi
		 */
		strategy?: T extends 'auto'
			? 'nearest' | 'random'
			: T extends 'direction'
			?
					| {
							/**Độ lệch so với hướng đã định, nếu không chỉ định, mặc định là 0 */
							'delta-angle': number;
					  }
					| undefined
			: never;
	};
}
