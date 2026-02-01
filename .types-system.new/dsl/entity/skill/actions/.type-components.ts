import { RandomDefinition } from '../../../.enums';
import { ActionPrefix, LockMethod } from './.enums';

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

interface UseStrategy<T extends string> {
	strategy?: { type: T } & Record<string, any>;
}

/**
 * Loại skill không ngữ cảnh cần modify direction dùng strategy này
 */
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

/**
 * Loại skill cần ngữ cảnh dùng strategy này
 */
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
