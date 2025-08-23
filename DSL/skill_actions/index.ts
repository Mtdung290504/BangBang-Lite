import type { CreateDamageAction } from './create_attack/create-damage';
import type { CreateProjectileAction } from './create_attack/create-projectile';

export type SkillAction = CreateProjectileAction | CreateDamageAction | `implement-later${string}`;
