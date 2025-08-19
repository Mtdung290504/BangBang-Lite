import type { SkillConsumption } from './skill-consumption';

type SkillAction = {
	/** Triển khai sau */
	actions: [];
};

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
	/** Định nghĩa loại và lượng tài nguyên tiêu hao */
	'resource-consumption'?: SkillConsumption;

	/** Danh sách hành động */
	actions: SkillAction[];
}

export type { SkillAction, ActionBased, SkillTiming };
