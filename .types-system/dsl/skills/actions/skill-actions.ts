import type { DealtDamage } from './apply_effect/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';
import type { RecoverEnergyAction } from './apply_effect/recover-energy';

type Description = { description?: string };

type SkillCastAction = ((CreateProjectileAction | RecoverEnergyAction) & Description) | `implement-later:${string}`;
type PassiveSkillAction = `implement-later:${string}` & Description;
type SkillHitAction = ((DealtDamage | RecoverEnergyAction) & Description) | `implement-later:${string}`;

export type { SkillCastAction, PassiveSkillAction, SkillHitAction };
