import { DealtDamage, ModifyStat, RecoverHP } from './apply-effect.type-entities';
import { CreateImpactor } from './create-attack.type-entities';
import { ChangePhase, Dash } from './do-action.type-entities';

export type SkillCastAction = CreateImpactor | ModifyStat | Dash | ChangePhase;
export type SkillHitAction = DealtDamage | ModifyStat | RecoverHP;
export type PassiveSkillAction = `implement-later:${string}`;
