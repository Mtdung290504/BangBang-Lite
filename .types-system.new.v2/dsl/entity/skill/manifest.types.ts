import { EffectManifest } from './actions/apply-effect.types';
import { EffectAction } from './actions/apply-effect.type-entities';
import { SkillManifest } from './.type-entities';

/**
 * Generic helper để định nghĩa SkillManifest, ép kiểu cho Effect Name trong ApplyEffect
 */
export type DefineSkill<
	EffectNames extends string = string,
	PhaseNames extends string = string,
	Effects extends Record<EffectNames, EffectManifest<EffectNames, EffectAction<EffectNames>>> = Record<
		EffectNames,
		EffectManifest<EffectNames, EffectAction<EffectNames>>
	>,
> = {
	effects?: Effects;
	manifest: SkillManifest<EffectNames, PhaseNames>;
};
