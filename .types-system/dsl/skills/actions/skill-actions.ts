import type { DealtDamage } from './apply_effect/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';
import type { SkillCast, SkillCastingMethods, TargetedSkillCast } from '../context/context.casting-methods';

type SkillCastAction<CastingMethod extends SkillCastingMethods = SkillCastingMethods> = CastingMethod extends SkillCast
	? CreateProjectileAction | `implement-later:${string}`
	: CastingMethod extends TargetedSkillCast
	? DealtDamage | `implement-later:${string}`
	: `implement-later:${string}`;

type PassiveSkillAction = `implement-later:${string}`;

export type { SkillCastAction, PassiveSkillAction };
