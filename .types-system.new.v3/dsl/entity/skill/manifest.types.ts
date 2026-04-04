import { EffectManifest } from './actions/apply-effect.types';
import { SkillManifest } from './.type-entities';

export type EffectManifestRecord = Record<string, EffectManifest>;

/**
 * Generic helper để định nghĩa SkillManifest
 */
export type DefineSkill = {
	effects?: EffectManifestRecord;
	manifest: SkillManifest;
};
