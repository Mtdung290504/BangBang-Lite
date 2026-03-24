import { Faction } from '../../../combat/.enums';
import { LimitedDuration } from '../../../combat/state.type-components';
import { ApplyEffect, ChangePhase } from './apply-effect.type-entities';
import { CreateImpactor, CreateTargetedImpactor } from './create-attack.type-entities';

export type SkillTargetedCastAction<T extends string = string> = CreateTargetedImpactor<T>;
export type SkillCastAction<T extends string = string> = CreateTargetedImpactor<T> | CreateImpactor<T> | ChangePhase;
export type PassiveSkillAction<T extends string = string> = `implement-later:${string}`;


export type ImpactAction<T extends string = string> = {
	/** Mặc định: `['enemy', 'tower']` */
	'affected-faction'?: Faction[];
} & ImpactHandle<T>;

export type ImpactHandle<
	T extends string = string,
	TargetEffect extends object = ApplyEffect<T>,
	SelfAction extends object = SkillCastAction<T> | ApplyEffect<T>,
> =
	| {
			'target-effect': TargetEffect | TargetEffect[];
			'self-action'?: SelfAction | SelfAction[];
	  }
	| {
			'target-effect'?: TargetEffect | TargetEffect[];
			'self-action': SelfAction | SelfAction[];
	  };
