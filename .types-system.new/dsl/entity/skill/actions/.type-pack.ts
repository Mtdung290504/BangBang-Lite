import type { DealtDamage } from './apply_effect/dealt-damage';
import type { ModifyEnergyAction } from './apply_effect/modify-energy';
import type { SuperMoveAction } from './move/super-move';
import type { RecoverHP } from './apply_effect/recover-hp';
import { ChangePhase } from './apply_effect/change-phase';
import { CreateProjectile } from './create-attack.type-entities';

type Description = { description?: string };

export type SkillCastAction = (CreateProjectile | ModifyEnergyAction | SuperMoveAction | ChangePhase) & Description;
export type PassiveSkillAction = `implement-later:${string}` & Description;
export type SkillHitAction = (DealtDamage | ModifyEnergyAction | RecoverHP) & Description;
