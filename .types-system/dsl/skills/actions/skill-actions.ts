import type { DealtDamage } from './apply_effect/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';
import type { ModifyEnergyAction } from './apply_effect/modify-energy';
import type { SuperMoveAction } from './move/super-move';
import type { RecoverHP } from './apply_effect/recover-hp';
import { ChangePhase } from './apply_effect/change-phase';

type Description = { description?: string };

type SkillCastAction =
	| ((CreateProjectileAction | ModifyEnergyAction | SuperMoveAction | ChangePhase) & Description)
	| `implement-later:${string}`;
type PassiveSkillAction = `implement-later:${string}` & Description;
type SkillHitAction = ((DealtDamage | ModifyEnergyAction | RecoverHP) & Description) | `implement-later:${string}`;

export type { SkillCastAction, PassiveSkillAction, SkillHitAction };
