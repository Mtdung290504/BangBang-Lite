import { CastingMethod } from './context/casting-methods.type-components';
import { EffectAction } from './actions/apply-effect.type-entities';

/** Thời gian hồi chiêu dùng chung cho mọi skill */
export interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây (Mặc định: 0) */
	cooldown?: number;
}

/**
 * Các thuộc tính cấu hình logic cho một cụm Action do Skill gọi ra
 */
export interface ActionProps {
	/** Object do skill tạo ra mang tính chất là đánh thường hay skill */
	property?: 'skill' | 'normal-attack';
}

export type ActionBased = {
	/**
	 * Khai báo indicator hiển thị cho người chơi, không ảnh hưởng logic.
	 * Mặc định: không hiển thị indicator
	 */
	'casting-method'?: CastingMethod;

	/**
	 * Mô tả tùy chỉnh
	 */
	description?: string;
	actions: EffectAction | EffectAction[];
} & ActionProps;
