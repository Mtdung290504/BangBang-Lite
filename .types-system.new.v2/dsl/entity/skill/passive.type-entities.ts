import type { ActionBased, SkillTiming } from './.type-components';
import { SkillTypeDef } from './.types';

/**
 * Passive skill = SkillEntry thường, khác active ở engine behavior:
 * - Auto-trigger khi CD xong (không cần key press)
 * - Immune silent (slot passive không bị câm)
 *
 * Event subscription nằm trong effect mà passive tạo ra (on-event trong EffectImpactManifest),
 * không phải trong passive type.
 *
 * Flow: CD xong → auto-trigger → actions (thường áp effect lên mình)
 *       → effect chứa on-event hooks → event fires → actions
 *       → có thể reset CD passive (ModifyCountdown)
 *
 * Các case biểu diễn:
 * - Khiên periodic: CD=10s, tạo khiên, khiên vỡ → on-end reset CD → CD xong → trigger lại
 * - On-hit (Kirito): CD=0, áp effect vĩnh viễn với on-event: { 'on-hit-taken': [buff] }
 * - On-kill buff: CD=0, áp effect vĩnh viễn với on-event: { 'on-destroy': [buff 5s] }
 * - Permanent buff: CD=0, áp effect unremovable với modify-stats
 */
export type SinglePassiveSkill<E extends string = string> = SkillTiming & ActionBased<E> & SkillTypeDef<'normal'>;

export type PhasedPassiveSkill<E extends string = string, P extends string = string> = {
	type: 'phased';

	/**
	 * Định nghĩa từng phase như 1 passive skill đơn
	 */
	'phases-definition': Record<P, SinglePassiveSkill<E>>;
};

export type PassiveSkillEntry<E extends string = string, P extends string = string> =
	| SinglePassiveSkill<E>
	| PhasedPassiveSkill<E, P>;
