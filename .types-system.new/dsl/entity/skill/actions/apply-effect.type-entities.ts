import { ActionType } from './.type-components';
import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { TextVisual } from '../../../combat/visual.type-components';
import { DamageType } from '../../tank/.enums';
import { EffectManifest } from '../../../combat/status.type-components';

// Sửa HP và MP
type ModifyStats<ActionTypeName extends string> = ActionType<'apply', ActionTypeName> & StatValue & TextVisual;
export interface DealtDamage extends ModifyStats<'dealt-damage'> {
	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;

	/** Cờ để trừ damage trong một số trường hợp, ví dụ khi đạn nảy hay xuyên */
	'is-main-damage'?: boolean;
}
export interface RecoverHP extends ModifyStats<'recover-hp'> {}
export interface ModifyEnergy extends ModifyStats<'modify-energy'> {}

// Sửa phase
export interface ChangePhase extends ActionType<'apply', 'change-phase'>, LimitedDuration {
	method: 'next' | `to-phase:${number}`;
}

// Sửa các chỉ số khác như tốc chạy, tốc đánh, giáp,...
export interface ModifyStat extends ActionType<'apply', 'modify-stat'>, StatValue, LimitedDuration {}

export interface ApplyEffect extends ActionType<'apply', 'effect'> {
	effect: EffectManifest;
}

const t: ModifyStat = {
	action: '@apply:modify-stat',
	'value-from': { attribute: 'attack-power', of: 'self', value: '50%' },
	duration: 2,
};
