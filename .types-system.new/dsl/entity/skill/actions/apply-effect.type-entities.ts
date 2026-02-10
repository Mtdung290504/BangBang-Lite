import { ActionType } from './.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';
import { EffectManifest } from './apply-effect.types';

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

// Khống chế cứng
// TODO: Implement later

export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	'effect-manifest': EffectManifest;
}
