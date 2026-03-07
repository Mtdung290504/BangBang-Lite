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
export interface ChangePhase extends ActionType<'do-act', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${number}`;

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
 * Note, trong triển khai đảo ngược lại, apply immune thực chất là clear component có thể bị ảnh hưởng\
 * VD:
 * - 2 tầng no-immune-slow -> áp slow, no-immune-CC -> áp CC còn all là gỡ hết?
 * - Không ổn,
 *
 */
export interface ApplyImmune extends ActionType<'apply', 'immune'> {
	filter: 'slow' | 'CC' | 'all';
}

export interface CleanEffect extends ActionType<'apply', 'clean-effect'> {
	filter: 'buff' | 'debuff' | 'immune' | 'slow' | 'CC' | `id:${string}` | 'all';
}

export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	manifest: EffectManifest<
		| DealtDamage
		| RecoverHP
		| ModifyEnergy
		| ModifyCountdown
		| ApplyShield
		| ApplySilent
		| ApplyImmune
		| CleanEffect
		| SkillCastAction
	>;
}
