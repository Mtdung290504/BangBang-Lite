import type { ActionBased, SkillTiming } from './.type-components';

export interface SkillConditions {
	/** Yêu cầu Tank phải có các phase này */
	'phase-has'?: string[];
	/** Yêu cầu Tank KHÔNG có các phase này */
	'phase-not-has'?: string[];
}

export type SkillEntry = SkillTiming & ActionBased & {
	/**
	 * Nguồn kích hoạt Skill. 
	 * VD: ['on-key:s1'], ['on-ready']
	 */
	triggers?: string[];

	/**
	 * Các điều kiện bắt buộc để skill có thể kích hoạt
	 */
	conditions?: SkillConditions;
};

