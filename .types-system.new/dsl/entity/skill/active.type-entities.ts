import type { ActionBased, SkillTiming } from './.type-components';
import { SkillTypeDef } from './.types';

/** Skill cơ bản, dùng xong hồi chiêu, không có gì đặc biệt */
export type NormalSkill = SkillTiming & ActionBased & SkillTypeDef<'normal'>;

/** Skill có tích lũy */
type StackedSkill = SkillTiming &
	ActionBased &
	SkillTypeDef<
		'stacked',
		{
			/** Số stack tối đa */
			'max-stack': 2 | 3 | 5;

			/** Thời gian hồi 1 stack, đơn vị: giây */
			'stack-time': number;
		}
	>;

/** Skill nhiều giai đoạn */
type MultiStageSkill = SkillTiming &
	SkillTypeDef<
		'multi-stage',
		{
			/** Danh sách hành vi của các giai đoạn */
			stages: ActionBased[];

			/** Quy định giới hạn thời gian tồn tại của 1 giai đoạn, đơn vị: giây */
			timeout: number;
		}
	>;

// Các union dùng cho manifest
type SingleSkill = NormalSkill | StackedSkill | MultiStageSkill;

/**
 * Skill thay đổi hành vi theo phase (Trạng thái/Hệ)\
 * *Thay đổi thành array, quy ước là index array cho dễ.
 */
type PhasedSkill = {
	type: 'phased';

	/**
	 * Định nghĩa từng phase như 1 skill đơn\
	 * Skill không có phase nào đó thì để trống, hệ thống cần tự fallback về phase 0
	 */
	'phases-definition': SingleSkill[];
};

/**
 * Chuyển kiểu theo có phase hay skill
 */
export type SkillEntry = SingleSkill | PhasedSkill;
