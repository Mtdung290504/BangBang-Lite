import { DealtDamage, ModifyStat, RecoverHP } from './apply-effect.type-entities';
import { CreateNonContextImpactor, CreateContextImpactor } from './create-attack.type-entities';
import { ChangePhase } from './do-action.type-entities';

export type SkillCastAction = CreateNonContextImpactor | ChangePhase;
export type SkillHitAction = CreateContextImpactor | DealtDamage | ModifyStat | RecoverHP;
export type PassiveSkillAction = `implement-later:${string}`;
