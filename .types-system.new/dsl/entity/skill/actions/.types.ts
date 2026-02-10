import { Faction } from '../../../combat/.enums';
import { LimitedDuration } from '../../../combat/state.type-components';
import { Renderable, VisualManifest } from '../../../combat/visual.type-components';
import { ApplyEffect, ChangePhase } from './apply-effect.type-entities';
import { CreateNonContextImpactor, CreateContextImpactor } from './create-attack.type-entities';

export type SkillCastAction = CreateContextImpactor | CreateNonContextImpactor | ChangePhase;
export type PassiveSkillAction = `implement-later:${string}`;

interface RequireDelayBase<Type extends string> extends Renderable {
	type: Type;

	/** Hành động có thể bị phá bởi khống chế hay không, không khai báo thì không thể phá, khai báo thì có */
	breakable?: true;

	/**
	 * @override
	 * Hiệu ứng/aura khi gồng/delay (nếu có)
	 */
	visual?: VisualManifest;
}

/**
 * Cấu hình khựng skill
 */
export interface RequireDelay extends RequireDelayBase<'delay'>, LimitedDuration {
	/**
	 * Thời gian khựng trước khi action thực sự kích hoạt
	 * @override
	 */
	duration: number;

	/** Thời gian bị đơ người sau khi action kích hoạt */
	recovery?: number;

	/**
	 * Có chặn các hành động khác như đang bị khống chế hay không?\
	 * Nếu không khai báo thì là không, nếu khai báo thì bắt buộc là true
	 */
	'block-actions'?: true;
}

/**
 * Cấu hình gồng skill *Làm cơ chế nhấn giữ chiêu + thả
 */
export interface RequireCharge extends RequireDelayBase<'charge'> {
	/**
	 * Thời gian gồng tối đa
	 * @override
	 */
	duration: number;

	/** Thời gian cưỡng chế giữ gồng tối thiểu */
	'min-duration': number;
}

export type ImpactAction<
	TargetEffect extends object = ApplyEffect,
	SelfAction extends object = SkillCastAction | ApplyEffect,
> = {
	/** Mặc định: `['enemy', 'neutral']` */
	'affected-faction'?: Faction[];
} & (
	| {
			'target-effect': TargetEffect[];
			'self-action'?: SelfAction[];
	  }
	| {
			'target-effect'?: TargetEffect[];
			'self-action': SelfAction[];
	  }
);
