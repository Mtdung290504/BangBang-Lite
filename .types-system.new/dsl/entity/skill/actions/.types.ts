import { DealtDamage, ModifyStat, RecoverHP } from './apply-effect.type-entities';
import { CreateNonContextImpactor, CreateContextImpactor } from './create-attack.type-entities';
import { ChangePhase } from './do-action.type-entities';

export type SkillCastAction = CreateContextImpactor | CreateNonContextImpactor | ChangePhase;
export type SkillHitAction = DealtDamage | ModifyStat | RecoverHP;
export type PassiveSkillAction = `implement-later:${string}`;
