import type { ActionBased, SkillTiming } from './base-skill';

/**
 * Skill cơ bản, dùng xong hồi chiêu, không có gì đặc biệt
 */
interface NormalSkill extends SkillTiming, ActionBased {
	type: 'normal';
}

/**
 * Skill có tích lũy
 */
interface StackedSkill extends SkillTiming, ActionBased {
	type: 'stacked';

	/** Số stack tối đa */
	'max-stack': 2 | 3 | 5;

	/** Thời gian hồi 1 stack, đơn vị: giây */
	'stack-time': number;
}

/**
 * Skill nhiều giai đoạn
 */
interface MultiStageSkill extends SkillTiming {
	type: 'multi-stage';

	/** Danh sách hành vi của các giai đoạn */
	stages: ActionBased[];

	/** Quy định giới hạn thời gian tồn tại của 1 giai đoạn, đơn vị: giây */
	timeout: number;
}

/**
 * Skill thay đổi hành vi theo phase (Trạng thái/Hệ)
 */
interface PhasedSkill<Phases extends number[]> {
	type: 'phased';

	/** Phase ban đầu được dùng */
	'default-phase': Phases[number];

	/** Định nghĩa từng phase như 1 skill đơn */
	'phases-definition': Record<Phases[number], NormalSkill>;
}

// Các union dùng cho manifest
type SingleSkill = NormalSkill | StackedSkill | MultiStageSkill;

/** Chuyển kiểu theo có phase hay skill */
type SkillEntry<Phases extends number[]> = Phases extends [] ? SingleSkill : SingleSkill | PhasedSkill<Phases>;

export type { SkillEntry };
