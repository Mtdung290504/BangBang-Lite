import type { TankEventActorsMap } from '../events/event-manifest';
import { AttackPowerStats, ShootingStats, SurvivalStats } from '../tank-manifest';
import { ValueWithUnit } from '../utils-types';
import type { SkillAction, SkillTiming } from './base-skill';

/**
 * Bị động kích hoạt theo event - Ví dụ Kirito
 */
interface EventTriggeredPassive extends SkillTiming {
	type: 'event-triggered';

	/** Event nào sẽ trigger */
	'trigger-event': keyof TankEventActorsMap;

	/**
	 * Điều kiện để trigger (optional)
	 * - Ví dụ trigger khi chịu dame, mà chịu xong HP phải dưới 30% mới kích hoạt
	 */
	condition?: [];

	/** Hành động khi trigger */
	actions: SkillAction;
}

/**
 * Bị động kích hoạt định kỳ theo thời gian (countdown) - Ví dụ: Hồ lô, Khiên LLQ/Iron/Chop
 */
interface PeriodicPassive extends SkillTiming {
	type: 'periodic';

	/** Hành động khi trigger */
	actions: SkillAction;

	/** Điều kiện để có thể trigger (optional) */
	conditions?: [];

	// Còn rắc rối khi cần kiểu "Khiên vỡ mới CD", có khi tách thành loại riêng cho lành
}

/**
 * Bị động buff chỉ số (có thể có hoặc không có điều kiện) - Ví dụ: Báo đen, Sát thủ
 */
interface PermanentBuffPassive {
	type: 'permanent-buff';

	/** Các stat được buff (Triển khai sau) */
	'stat-modifiers': {
		attribute: keyof ShootingStats | keyof SurvivalStats | keyof AttackPowerStats;
		value: ValueWithUnit;
	}[];

	/**
	 * Điều kiện để buff có hiệu lực (optional)
	 * - Ví dụ HP thấp hơn 40% mới tăng tốc
	 * - Xung quanh không có đồng đội
	 */
	conditions?: [];
}

// Phased passive skill (cho tank có nhiều phase)
interface PhasedPassiveSkill<Phases extends number[]> {
	type: 'phased';

	/** Phase ban đầu được dùng */
	'default-phase': Phases[number];

	/** Định nghĩa passive cho từng phase */
	'phases-definition': Record<Phases[number], SinglePassiveSkill>;
}

// Union type cho tất cả passive skills
type SinglePassiveSkill = EventTriggeredPassive | PeriodicPassive | PermanentBuffPassive;

// Entry type cho passive skill
type PassiveSkillEntry<Phases extends number[]> = Phases extends []
	? SinglePassiveSkill
	: SinglePassiveSkill | PhasedPassiveSkill<Phases>;

export type { PassiveSkillEntry };
