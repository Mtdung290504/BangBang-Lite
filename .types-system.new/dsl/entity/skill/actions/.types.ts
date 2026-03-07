import { Faction } from '../../../combat/.enums';
import { LimitedDuration } from '../../../combat/state.type-components';
import { ApplyEffect, ChangePhase } from './apply-effect.type-entities';
import { CreateImpactor, CreateTargetedImpactor } from './create-attack.type-entities';

export type SkillTargetedCastAction = CreateTargetedImpactor;
export type SkillCastAction = CreateImpactor | ChangePhase;
export type PassiveSkillAction = `implement-later:${string}`;

/**
 * Cấu hình khựng skill
 */
export interface RequireDelay extends LimitedDuration {
	/**
	 * Thời gian khựng trước khi action thực sự kích hoạt
	 * @override
	 */
	duration: number;

	/**
	 * Có chặn các hành động khác như đang bị khống chế hay không?\
	 * Nếu không khai báo thì là không, nếu khai báo thì bắt buộc là true
	 */
	'block-actions'?: true;
}

/**
 * Cấu hình gồng skill
 * - Lưu ý, gồng không có nghĩa là đứng im & câm lặng, chỉ như một bộ đếm thời gian
 */
export interface RequireCharge {
	/**
	 * Thời gian gồng tối đa
	 * @override
	 */
	duration: number;

	/** Thời gian cưỡng chế giữ gồng tối thiểu */
	'min-duration': number;
}

export type ImpactAction = {
	/** Mặc định: `['enemy', 'tower']` */
	'affected-faction'?: Faction[];
} & ImpactHandle;

export type ImpactHandle<
	TargetEffect extends object = ApplyEffect,
	SelfAction extends object = SkillCastAction | ApplyEffect,
> =
	| {
		'target-effect': TargetEffect | TargetEffect[];
		'self-action'?: SelfAction | SelfAction[];
	}
	| {
		'target-effect'?: TargetEffect | TargetEffect[];
		'self-action': SelfAction | SelfAction[];
	};
