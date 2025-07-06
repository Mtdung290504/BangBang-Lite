import type { CreateActions } from './create-actions.js';
import type { DoActions } from './do-actions.js';

type SkillAction = CreateActions | DoActions;

/** Thời gian hồi chiêu dùng chung cho mọi skill */
interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây */
	cooldown: number;
}

/** Hành vi cơ bản của 1 skill */
interface ActionBased {
	actions: SkillAction[];
}

/** Skill cơ bản nhất */
interface NormalSkill extends SkillTiming, ActionBased {
	type: 'normal';
}

/** Skill có tích lũy */
interface StackedSkill extends SkillTiming, ActionBased {
	type: 'stacked';

	/** Số stack tối đa */
	'max-stack': 2 | 3 | 5;

	/** Thời gian hồi 1 stack, đơn vị: giây */
	'stack-time': number;
}

/** Skill nhiều giai đoạn */
interface MultiStageSkill extends SkillTiming {
	type: 'multi-stage';

	/** Danh sách hành vi của các giai đoạn */
	stages: ActionBased[];

	/** Quy định giới hạn thời gian tồn tại của 1 giai đoạn, đơn vị: giây */
	'time-out': number;
}

/** Skill thay đổi hành vi theo các phase */
interface PhasedSkill<Phases extends string[]> {
	type: 'phased';

	/** Phase ban đầu được dùng */
	'default-phase': Phases[number];

	/** Định nghĩa từng phase như 1 skill đơn */
	'phases-definition': Record<Phases[number], NormalSkill>;
}

// Các union dùng cho manifest
export type SingleSkill = NormalSkill | StackedSkill | MultiStageSkill;
export type MultiPhaseSkill<Phases extends string[]> = PhasedSkill<Phases>;
