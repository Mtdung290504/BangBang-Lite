import type { CreateDamageAction } from './create_attack/dealt-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';

export type SkillAction = CreateProjectileAction | CreateDamageAction | `implement-later${string}`;
