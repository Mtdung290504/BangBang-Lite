import { ChangePhase, DealtDamage, ModifyEnergy, ModifyStat, RecoverHP } from './apply-effect.type-entities';
import { CreateNonContextImpactor, CreateContextImpactor } from './create-attack.type-entities';

export type SkillCastAction = CreateContextImpactor | CreateNonContextImpactor | ChangePhase;
export type SkillHitAction = DealtDamage | ModifyStat | RecoverHP | ModifyEnergy;
export type PassiveSkillAction = `implement-later:${string}`;
