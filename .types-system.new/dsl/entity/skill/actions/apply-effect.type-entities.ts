import { ActionType } from './.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';
import { EffectManifest } from './apply-effect.types';
import { ValueWithUnit } from '../../../.types';
import { ImpactHandle, SkillCastAction } from './.types';
import { SkillSlot, SpSkillSlot } from '../.enums';

// Sửa HP và MP
type ModifyPoints<ActionTypeName extends string> = ActionType<'apply', ActionTypeName> & StatValue & TextVisual;
export interface DealtDamage extends ModifyPoints<'dealt-damage'> {
	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;

	/**
	 * Cờ để chỉ định main damage để trừ damage trong một số trường hợp, ví dụ khi đạn nảy hay xuyên
	 * @default false
	 */
	'not-main-damage'?: true;
}
export interface RecoverHP extends ModifyPoints<'recover-hp'> {}
export interface ModifyEnergy extends ModifyPoints<'modify-energy'> {}

// Sửa phase
export interface ChangePhase<PhaseName extends string = string>
	extends ActionType<'do-act', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${PhaseName}`;

	/**
	 * @override
	 * Mặc định: Infinity
	 */
	duration?: number;
}

// Sửa các thứ khác
export interface ModifyCountdown extends ActionType<'apply', 'modify-countdown'> {
	slot: (SkillSlot | SpSkillSlot)[] | 'all';
	value: ValueWithUnit;
}

export interface ApplyShield extends ActionType<'apply', 'shield'> {
	value: ValueWithUnit;
	'on-break'?: ImpactHandle;
}

/**
 * Note:
 * - Choáng = Giảm tốc 100% + Silent
 * - Hất tung để tính sau
 */
export interface ApplySilent extends ActionType<'apply', 'silent'> {
	slot: (SkillSlot | SpSkillSlot)[] | 'all';
}

/**
 * Khóa chân (Root)
 * Khác với giảm tốc 100% ở chỗ CC này không bị xóa bởi giải trừ làm chậm chuyên biệt
 */
export interface ApplyRoot extends ActionType<'apply', 'root'> {}

/**
 * Bất bại (Invincible)
 * Miễn dịch mọi loại sát thương (thường đi kèm với immune CC để tạo thành trạng thái Vô địch hoàn toàn)
 */
export interface ApplyInvincible extends ActionType<'apply', 'invincible'> {}

/**
 * Không thể chọn làm mục tiêu (Untargetable)
 * Immune với các loại đạn/skill khóa mục tiêu (đạn bay xuyên qua không nổ)
 */
export interface ApplyUntargetable extends ActionType<'apply', 'untargetable'> {}

/**
 * Tàng hình (Invisible)
 * Mất tầm nhìn, có thể bị lộ nếu nhận sát thương hoặc tấn công (tùy config ở core, DSL chỉ quy định state)
 */
export interface ApplyInvisible extends ActionType<'apply', 'invisible'> {}

/**
 * Lộ tàng hình / Không thể tàng hình (Unstealthable)
 * Bị soi sáng bởi trụ hoặc skill, vô hiệu hóa trạng thái Tàng hình
 */
export interface ApplyUnstealthable extends ActionType<'apply', 'unstealthable'> {}

/**
 * Note, trong triển khai đảo ngược lại, apply immune thực chất là clear component có thể bị ảnh hưởng\
 * VD:
 * - 2 tầng no-immune-slow -> áp slow, no-immune-CC -> áp CC còn all là gỡ hết?
 * - Không ổn,
 *
 */
export interface ApplyImmune extends ActionType<'apply', 'immune'> {
	/**
	 * Note: id dành cho các hiệu ứng kiểu: Sau 6s sẽ không bị trúng lại hiệu ứng này nữa
	 */
	filter: `tag:${'slow' | 'CC' | 'all'}` | `id:${string}`;
}

export interface CleanEffect extends ActionType<'apply', 'clean-effect'> {
	filter: `tag:${'buff' | 'debuff' | 'immune' | 'slow' | 'CC' | 'all'}` | `id:${string}`;
}

export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	manifest: EffectManifest<
		| DealtDamage
		| RecoverHP
		| ModifyEnergy
		| ModifyCountdown
		| ApplyShield
		| ApplySilent
		| ApplyRoot
		| ApplyInvincible
		| ApplyUntargetable
		| ApplyInvisible
		| ApplyUnstealthable
		| ApplyImmune
		| CleanEffect
		| SkillCastAction
	>;
}
