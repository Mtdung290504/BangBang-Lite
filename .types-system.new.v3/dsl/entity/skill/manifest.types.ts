import { EffectManifest } from './actions/apply-effect.types';
import { SkillManifest } from './.type-entities';

/**
 * Generic helper để định nghĩa SkillManifest
 */
export type DefineSkill = {
	effects?: Record<string, EffectManifest>;
	manifest: SkillManifest;
};
