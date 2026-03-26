import { ActionType } from './.type-components';
import type { CurrentStatKeys, LostStatKeys, TankStatValueKey } from '../../tank/.enums';
import type { SkillSlot, SpSkillSlot } from '../.enums';
import type { ValueWithUnit } from '../../../.types';
import type { ValueResolver, ReductionFn, ConditionPredicate } from '../../../runtime.types';
import type { ImpactHandle, SkillCastAction } from './.types';

// ===== Tầng ①: Continuous Stat Modifier (tồn tại theo effect duration) =====

/**
 * Điều chỉnh stat liên tục, tồn tại theo effect duration.
 * Vị trí khai báo: `modify-stats` trong `EffectImpactManifest`
 *
 * @example
 * // Buff tốc 20%
 * { attribute: 'movement-speed', value: '20%' }
 *
 * // HP càng thấp chạy càng nhanh — function resolver
 * { attribute: 'movement-speed',
 *   value: (ctx) => ctx.self['movement-speed'] * (ctx.self['lost-HP'] / ctx.self['limit-HP']) }
 *
 * // Giảm tốc 30%, bị kháng hiệu ứng
 * { attribute: 'movement-speed', value: '-30%', reductions: [effectResistance] }
 */
export interface StatModifier {
	attribute: Exclude<TankStatValueKey, CurrentStatKeys | LostStatKeys>;
	value: ValueWithUnit | ValueResolver;

	/** Pipeline giảm trừ (optional). Designer dùng template có sẵn. */
	reductions?: ReductionFn | ReductionFn[];
}

// ===== Tầng ②: State (tồn tại theo effect duration) =====

/**
 * Trạng thái on/off, tồn tại theo effect duration.
 * Vị trí khai báo: `states` trong `EffectImpactManifest`
 *
 * Note: Choáng = giảm tốc 100% (modify-stats) + silent all (states)
 */
export type StateEntry =
	| { type: 'silent'; slot: (SkillSlot | SpSkillSlot)[] | 'all' }
	| { type: 'root' }
	| { type: 'invincible' }
	| { type: 'untargetable' }
	| { type: 'invisible' }
	| { type: 'unstealthable' }
	| { type: 'immune'; filter: `tag:${'slow' | 'CC' | 'all'}` | `id:${string}` }
	| {
			/**
			 * Note: khi muốn vỡ hết khiên thì tăng/giảm stack\
			 * Giới hạn đến stack nào đó on-start sẽ clean effect theo id (name) là xóa được
			 */
			type: 'impact-shield';

			/**
			 * Xử lý impact:
			 * - negate: vô hiệu (damage = 0, effect không áp)
			 * - destroy: xóa sổ đòn đó luôn
			 */
			mode: 'negate' | 'destroy';

			/**
			 * Filter loại impact. Mặc định: 'all', VD:
			 * - skill: GCL
			 * - normal-attack: SSK
			 * - flying-object: Zr
			 */
			filter?: 'all' | 'skill' | 'normal-attack' | 'flying-object';
	  };

// ===== Tầng ③: Instant Actions (trong on-start/on-interval/on-end) =====

/**
 * Điều chỉnh stat TỨC THÌ — dùng trong on-start/on-interval/on-end.
 * Không instant flag — vị trí khai báo đã quyết định bản chất.
 *
 * @example
 * // Gây 150% attack-power damage vật lý
 * { action: '@apply:modifier', attribute: 'current-HP',
 *   value: (ctx) => -ctx.self['attack-power'] * 1.5,
 *   reductions: [physicalArmor] }
 *
 * // Hồi 200% attack-power HP (giá trị dương)
 * { action: '@apply:modifier', attribute: 'current-HP',
 *   value: (ctx) => ctx.self['attack-power'] * 2 }
 *
 * // True damage 50% HP đã mất
 * { action: '@apply:modifier', attribute: 'current-HP',
 *   value: (ctx) => -ctx.target['lost-HP'] * 0.5 }
 */
export interface ApplyModifier extends ActionType<'apply', 'modifier'> {
	attribute: CurrentStatKeys;
	value: ValueWithUnit | ValueResolver;

	/** Pipeline giảm trừ (optional). Không có = không giảm (true damage/heal). */
	reductions?: ReductionFn | ReductionFn[];
}

// ===== Các action khác giữ nguyên =====

/** Sửa phase */
export interface ChangePhase<PhaseName extends string = string> extends ActionType<'do-act', 'change-phase'> {
	method: 'next' | `to-phase:${PhaseName}` | `extend-phase:${PhaseName}`;

	/**
	 * @override
	 * @default Infinity
	 */
	duration?: number;
}

/** Sửa countdown skill */
export interface ModifyCountdown extends ActionType<'apply', 'modify-countdown'> {
	slot: (SkillSlot | SpSkillSlot | `passive.${number}`)[];
	value: ValueWithUnit;
}

/** Khiên */
export interface ApplyShield extends ActionType<'apply', 'shield'> {
	value: ValueResolver;
	'on-break'?: ImpactHandle;
}

/**
 * Xóa effect\
 * *Lưu ý*: unremovable của effect chỉ chống bị remove by tag, khi hết thời gian hay remove by id vẫn bị xóa
 */
export interface CleanEffect extends ActionType<'apply', 'clean-effect'> {
	filter: `tag:${'buff' | 'debuff' | 'immune' | 'slow' | 'CC' | 'all'}` | `id:${string}`;
}

/** Áp effect mới theo tên đã định nghĩa sẵn trong SkillManifest */
export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	effect: string;
}

/** Tạm dừng chuỗi action hiện tại */
export interface WaitAction extends ActionType<'do-act', 'wait'> {
	duration: number;
	'on-interrupt'?: EffectAction | EffectAction[];
}

/** Bắt đầu hoặc kết thúc đếm thời gian gồng */
export interface ModifyChargeAction extends ActionType<'do-act', 'modify-charge'> {
	method: 'start' | 'end';
	name: string;
}

/** Đẩy lui (Vector tính từ nguồn va chạm đập ra) */
export interface ApplyKnockback extends ActionType<'apply', 'knockback'> {
	speed: ValueResolver;
}

/**
 * Đẩy hướng tâm (Radial Push)
 * Điểm neo: Tâm của source (đạn/người chơi)
 * - Tốc độ dương: Hút vào tâm (Engine tự ngắt khi tới điểm neo)
 * - Tốc độ âm (-): Đẩy văng ra xa
 */
export interface ApplyRadialPush extends ActionType<'apply', 'radial-push'> {
	speed: ValueResolver;
}

/** Gọi một skill bất kỳ thông qua tên định nghĩa trong SkillManifest */
export interface ActivateSkillAction extends ActionType<'do-act', 'activate-skill'> {
	skill: string;
}

/**
 * Union tất cả action có thể dùng trong on-start/on-interval/on-end và skill actions
 */
export type EffectAction =
	| ApplyModifier
	| SkillCastAction
	| ApplyEffect
	| CleanEffect
	| ChangePhase
	| ModifyCountdown
	| WaitAction
	| ModifyChargeAction
	| ApplyKnockback
	| ApplyRadialPush
	| ActivateSkillAction;
