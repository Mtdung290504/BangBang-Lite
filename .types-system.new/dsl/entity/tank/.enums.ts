import { AdditionalStats, AttackPowerStats, ShootingStats, SurvivalStats } from './.types';

/**Thuộc tính tank - Vật lý hay năng lượng */
export type TankDamageType = 'physical' | 'energy';

/**Loại sát thương tạo ra - Vật lý, năng lượng hoặc chuẩn */
export type DamageType = 'true' | TankDamageType;

export type BonusStatStateEnum = `${'limit' | 'current' | 'lost'}${'-HP' | '-energy-point'}`;

export type FireRateEnum = 60 | 90 | 120;
export type CritDamageEnum = 150 | 200;
export type EnergyAmountEnum = 100 | 150 | 200;

export type TankStatValueKey =
	| keyof (ShootingStats & SurvivalStats & Omit<AttackPowerStats, 'damage-type'> & AdditionalStats)
	| BonusStatStateEnum
	| 'movement-speed';
