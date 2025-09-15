import type { DealtDamage } from './apply_effect/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';
import type { RecoverEnergyAction } from './apply_effect/recover-energy';

type Description = { description?: string };

type SkillCastAction = (CreateProjectileAction | RecoverEnergyAction | `implement-later:${string}`) & Description;
type PassiveSkillAction = `implement-later:${string}` & Description;
type SkillHitAction = (DealtDamage | RecoverEnergyAction | `implement-later:${string}`) & Description;

export type { SkillCastAction, PassiveSkillAction, SkillHitAction };
