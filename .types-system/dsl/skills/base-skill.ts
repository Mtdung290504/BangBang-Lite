import type { SkillConsumption } from './skill-consumption';
import type { SkillAction } from './actions/index';
import type { SkillCastingMethods } from './context/context.casting-methods';

/** Thời gian hồi chiêu dùng chung cho mọi skill */
interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây (Mặc định: 0) */
	cooldown?: number;
}

/**
 * Hành vi cơ bản của 1 skill
 * - Nó làm gì
 * - Nó tiêu hao gì
 */
interface ActionBased {
	/**
	 * Định nghĩa loại và lượng tài nguyên tiêu hao
	 * Note: Một số skill có thể sử dụng current-energy-point để tăng damage nên tung ra, lưu snapshot vào skill hay gì đó rồi hẵn trừ
	 */
	'resource-consumption'?: SkillConsumption;

	/** Đánh thường cũng phải có casting (Ví dụ đánh thường cường hóa của KKS) */
	'casting-method'?: SkillCastingMethods;

	/** Cờ để tăng ST hoặc cho các skill hấp thụ */
	property: 'skill' | 'normal-attack';

	/** Danh sách hành động */
	actions: SkillAction[];
}

export type { SkillAction, ActionBased, SkillTiming };
