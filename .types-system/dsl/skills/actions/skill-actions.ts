import type { DealtDamage } from './apply_effect/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';
import type { RecoverEnergyAction } from './apply_effect/recover-energy';
import type { SuperMoveAction } from './move/super-move';
import type { RecoverHP } from './apply_effect/recover-hp';

type Description = { description?: string };

type SkillCastAction =
	| ((CreateProjectileAction | RecoverEnergyAction | SuperMoveAction) & Description)
	| `implement-later:${string}`;
type PassiveSkillAction = `implement-later:${string}` & Description;
type SkillHitAction = ((DealtDamage | RecoverEnergyAction | RecoverHP) & Description) | `implement-later:${string}`;

export type { SkillCastAction, PassiveSkillAction, SkillHitAction };
