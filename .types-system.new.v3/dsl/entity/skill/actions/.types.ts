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
> =
	| {
			'target-effect': TargetEffect | TargetEffect[];
			'self-action'?: SelfAction | SelfAction[];
	  }
	| {
			'target-effect'?: TargetEffect | TargetEffect[];
			'self-action': SelfAction | SelfAction[];
	  };
