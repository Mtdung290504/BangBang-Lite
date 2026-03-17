import { LimitedDuration } from './state.components';
import { Renderable } from './visual.components';
import { ApplyModifier } from './effect.components';
import { CombatState } from './state.components';

// ---------------------------------------------------------------------------
// TYPES-SYSTEM V2: EFFECT MANIFEST SPLIT ARCHITECTURE
// ---------------------------------------------------------------------------

export interface EffectManifestBase extends Renderable, LimitedDuration {
	/** Tên dùng cho tool / UI */
	name?: string;

	/** Nhãn để quản lý vòng đời (VD: 'fire-dot', 'slow-debuff') dùng cho hàm xóa */
	tags?: string[];
}

/**
 * 1. STAT MODIFIER EFFECT
 * Chỉ thay đổi chỉ số. Tuyệt đối an toàn.
 */
export interface StatModifierEffect extends EffectManifestBase {
	type: 'stat-modifier';
	
	/** Các Modifier áp dụng (Buff/Debuff) */
	'modify-stats': ApplyModifier | ApplyModifier[];
}

/**
 * 2. STATE MODIFIER EFFECT
 * Chỉ áp dụng trạng thái (CC, Bất tử). Tuyệt đối an toàn.
 */
export interface StateModifierEffect extends EffectManifestBase {
	type: 'state-modifier';
	
	/** Các Trạng thái áp dụng */
	'apply-states': CombatState[];
}

/**
 * 3. TRIGGER / ACTUATOR EFFECT
 * Chỉ làm bộ đếm nhịp. Đẻ ra Action khác. Vùng có nguy cơ đệ quy nhưng đã được Type System chặn.
 */
export interface TriggerEffect<ActionBase> extends EffectManifestBase {
	type: 'trigger-actuator';

	/** Thời gian chờ giữa các lần mọc interval (giây). NẾU KHÔNG CÓ => Chỉ kích hoạt 1 lần khi On-End */
	interval?: number;

	/** Hành động kích hoạt định kỳ. CHỈ ĐƯỢC CHỨA ACTION CƠ BẢN hoặc THÊM GÓI STAT/STATE. KHÔNG ĐƯỢC ĐẺ RA TRIGGER KHÁC. */
	'on-interval'?: ActionBase | StatModifierEffect | StateModifierEffect;

	/** Kích hoạt khi hết duration / bị xóa */
	'on-end'?: ActionBase | StatModifierEffect | StateModifierEffect;
}

export type SkillEffect<ActionBase> = StatModifierEffect | StateModifierEffect | TriggerEffect<ActionBase>;
