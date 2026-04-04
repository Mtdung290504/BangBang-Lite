import type { ActionBased, SkillTiming } from './.type-components';
import type { ConditionPredicate } from '../../runtime.types';
import type { SkillSlot, SpSkillSlot } from './.enums';
import { Renderable } from '../../combat/visual.type-components';

export type TriggerEvent = `on-key:${SkillSlot | SpSkillSlot}` | 'on-ready';

/**
 * Định nghĩa 1 phase của skill.
 * - Index trong mảng = số phase (0 = default).
 * - Engine dùng phase index để quyết định icon + cooldown bar hiển thị trên HUD.
 * - conditions quyết định phase này có fire khi người chơi nhấn key không.
 */
export type SkillPhaseEntry = SkillTiming &
	Renderable &
	ActionBased & {
		/**
		 * @override
		 * Icon skill, chỉ khai báo sprite key
		 */
		visual?: {
			sprite?: { key: string };
		};

		/**
		 * Nguồn kích hoạt Skill (chặt chẽ theo Slot).
		 */
		triggers?: TriggerEvent[];

		/**
		 * Các điều kiện bắt buộc để skill có thể kích hoạt
		 */
		conditions?: ConditionPredicate;
	};

/**
 * Skill slot có thể khai báo:
 * - 1 phase đơn (SkillPhaseEntry) — phổ biến nhất
 * - Mảng phases (SkillPhaseEntry[]) — khi skill cần đổi icon/CD theo trạng thái
 *   - Index 0 = phase mặc định
 *   - Index N = phase N (do `@do-act:change-phase` chuyển tới)
 *
 * @example
 * // Normal skill — 1 phase
 * 'normal-attack': { triggers: ['on-key:normal-attack'], actions: [...] }
 *
 * // Multi-phase — icon thay đổi theo phase
 * 'normal-attack': [
 *   { icon: 'normal-atk-default', triggers: ['on-key:normal-attack'], conditions: ctx => !ctx.hasEffect('s2-empower'), actions: [...] },
 *   { icon: 'normal-atk-s2',     triggers: ['on-key:normal-attack'], conditions: ctx =>  ctx.hasEffect('s2-empower'), actions: [...] },
 * ]
 */
export type SkillEntry = SkillPhaseEntry | SkillPhaseEntry[];
