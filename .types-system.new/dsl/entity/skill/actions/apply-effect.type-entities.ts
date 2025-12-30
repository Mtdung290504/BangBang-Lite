import { ActionType } from '../../../combat/action.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';

export interface DealtDamage extends ActionType<'apply-effect', 'dealt-damage'>, StatValue, TextVisual {
	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;

	/** Cờ để trừ damage trong một số trường hợp, ví dụ khi đạn nảy hay xuyên */
	'is-main-damage'?: boolean;
}
export interface RecoverHP extends ActionType<'apply-effect', 'recover-hp'>, StatValue, TextVisual {}

export interface ModifyStat extends ActionType<'apply-effect', 'modify-stat'>, StatValue, LimitedDuration {}
