import { ActionType } from './.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';
import { EffectManifest, CleanEffectManifest } from './apply-effect.types';

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
export interface ModifyCountdown {}
export interface ApplyShield {}

/**
 * Note:
 * - Choáng = Giảm tốc 100% + Silent
 * - Hất tung để tính sau
 */
export interface ApplySilent extends ActionType<'apply', 'silent'> {
	skill?: boolean;
	'normal-attack'?: boolean;
}

export interface ApplyImmune extends ActionType<'apply', 'immune'> {}

export interface CleanEffect extends ActionType<'apply', 'clean-effect'> {
	filter: 'all' | 'all-adverse' | 'all-beneficial' | 'CC-only' | 'immune-only' | 'slow-only' | `id:${string}`;
}

export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	manifest: EffectManifest;
}
