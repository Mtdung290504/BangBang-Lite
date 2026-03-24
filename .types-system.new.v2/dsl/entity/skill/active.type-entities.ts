import type { ActionBased, SkillTiming } from './.type-components';
import { SkillTypeDef } from './.types';

/** Skill cơ bản, dùng xong hồi chiêu, không có gì đặc biệt */
export type NormalSkill<T extends string = string> = SkillTiming & ActionBased<T> & SkillTypeDef<'normal'>;

/** Skill có tích lũy */
type StackedSkill<T extends string = string> = SkillTiming &
	ActionBased<T> &
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
type MultiStageSkill<T extends string = string> = SkillTiming &
	SkillTypeDef<
		'multi-stage',
		{
			/** Danh sách hành vi của các giai đoạn */
			stages: ActionBased<T>[];

			/** Quy định giới hạn thời gian tồn tại của 1 giai đoạn, đơn vị: giây */
			timeout: number;
		}
	>;

// Các union dùng cho manifest
type SingleSkill<T extends string = string> = NormalSkill<T> | StackedSkill<T> | MultiStageSkill<T>;

/**
 * Skill thay đổi hành vi theo phase (Trạng thái/Hệ)\
 * *Thay đổi thành array, quy ước là index array cho dễ.
 */
type PhasedSkill<T extends string = string> = {
	type: 'phased';

	/**
	 * Định nghĩa từng phase như 1 skill đơn\
	 * Skill không có phase nào đó thì để trống, hệ thống cần tự fallback về phase 0
	 */
	'phases-definition': SingleSkill<T>[];
};

/**
 * Chuyển kiểu theo có phase hay skill
 */
export type SkillEntry<T extends string = string> = SingleSkill<T> | PhasedSkill<T>;
