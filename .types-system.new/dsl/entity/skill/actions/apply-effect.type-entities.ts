import { ActionType } from '../../../combat/action.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';

// Sửa HP và MP
type ModifyStats<ActionTypeName extends string> = ActionType<'apply-effect', ActionTypeName> & StatValue & TextVisual;
export interface DealtDamage extends ModifyStats<'dealt-damage'> {
	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;

	/** Cờ để trừ damage trong một số trường hợp, ví dụ khi đạn nảy hay xuyên */
	'is-main-damage'?: boolean;
}
export interface RecoverHP extends ModifyStats<'recover-hp'> {}
export interface ModifyEnergy extends ModifyStats<'modify-energy'> {}

// Sửa phase
export interface ChangePhase extends ActionType<'apply-effect', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${number}`;
}

// Sửa các chỉ số khác như tốc chạy, tốc đánh, giáp,...
export interface ModifyStat extends ActionType<'apply-effect', 'modify-stat'>, StatValue, LimitedDuration {}
