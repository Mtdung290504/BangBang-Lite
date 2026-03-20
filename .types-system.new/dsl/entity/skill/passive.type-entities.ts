import type { TankEventActorsMap } from './context/.types';
import type { StatModifier } from './actions/apply-effect.type-entities';
import type { ConditionPredicate } from '../../runtime.types';

import { SkillTiming } from './.type-components';
import { SkillTypeDef } from './.types';

// Note sửa ActionBased thành chuyên biệt cho passive skill
// import { PassiveSkillAction } from '../actions/skill-actions';
type PassiveSkillAction = `Implement later:${string}`;

/**
 * Bị động kích hoạt theo event - Ví dụ Kirito
 */
type EventTriggeredPassive = SkillTiming &
	SkillTypeDef<
		'event-triggered',
		{
			/** Event nào sẽ trigger */
			'trigger-event': keyof TankEventActorsMap;

			/**
			 * Điều kiện để trigger (optional)
			 * - Ví dụ trigger khi chịu dame, mà chịu xong HP phải dưới 30% mới kích hoạt
			 */
			condition?: ConditionPredicate;

			/** Hành động khi trigger */
			actions: PassiveSkillAction[];
		}
	>;

/**
 * Bị động kích hoạt định kỳ theo thời gian (countdown) - Ví dụ: Hồ lô, Khiên LLQ/Iron/Chop
 * *Note:* Tạo một cơ chế trigger now, áp một effect vĩnh cửu
 */
type PeriodicPassive = SkillTiming &
	SkillTypeDef<
		'periodic',
		{
			/** Hành động khi trigger */
			actions: PassiveSkillAction[];

			/** Điều kiện để có thể trigger (optional) */
			conditions?: ConditionPredicate;

			// Còn rắc rối khi cần kiểu "Khiên vỡ mới CD", có khi tách thành loại riêng cho lành
			// => Khiên vỡ thì trigger full CD, quan tâm đếch gì CD gốc? XONG.
		}
	>;

/**
 * Bị động buff chỉ số (có thể có hoặc không có điều kiện) - Ví dụ: Báo đen, Sát thủ
 */
type PermanentBuffPassive = SkillTypeDef<
	'permanent-buff',
	{
		/** Các stat được buff — dùng StatModifier mới (hỗ trợ function resolver) */
		'stat-modifiers': StatModifier | StatModifier[];

		/**
		 * Điều kiện để buff có hiệu lực (optional)
		 * - Ví dụ HP thấp hơn 40% mới tăng tốc
		 * - Xung quanh không có đồng đội
		 */
		conditions?: ConditionPredicate;
	}
>;

// Phased passive skill (cho tank có nhiều phase)
type PhasedPassiveSkill<Phases extends number[]> = SkillTypeDef<
	'phased',
	{
		/** Phase ban đầu được dùng */
		'default-phase': Phases[number];

		/** Định nghĩa passive cho từng phase */
		'phases-definition': Record<Phases[number], SinglePassiveSkill>;
	}
>;

// Union type cho tất cả passive skills
type SinglePassiveSkill = EventTriggeredPassive | PeriodicPassive | PermanentBuffPassive;

// Entry type cho passive skill
export type PassiveSkillEntry<Phases extends number[]> = Phases extends []
	? SinglePassiveSkill
	: SinglePassiveSkill | PhasedPassiveSkill<Phases>;
