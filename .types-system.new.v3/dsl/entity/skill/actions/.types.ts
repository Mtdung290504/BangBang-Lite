import { Faction } from '../../../combat/.enums';
import { ApplyEffect, ChangePhase } from './apply-effect.type-entities';
import { CreateImpactor } from './create-attack.type-entities';

export type SkillCastAction = CreateImpactor | ChangePhase;

export type ImpactAction = {
	/** Mặc định: `['enemy', 'tower']` */
	'affected-faction'?: Faction[];
} & ImpactHandle;

export type ImpactHandle<
	TargetEffect extends object = ApplyEffect,
	SelfAction extends object = SkillCastAction | ApplyEffect,
> = {
	/**Effect lên mục tiêu trúng */
	'target-effect'?: TargetEffect | TargetEffect[];

	/**Effect lên bản thân */
	'self-effect'?: TargetEffect | TargetEffect[];

	/**Action của bản thân */
	actions?: SelfAction | SelfAction[];
};
