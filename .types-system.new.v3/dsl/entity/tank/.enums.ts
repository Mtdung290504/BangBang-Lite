import { AdditionalStats, AttackPowerStats, ShootingStats, SurvivalStats } from './.types';

export type CurrentStatKeys = `${'current'}${'-HP' | '-energy-point'}`;
export type LostStatKeys = `${'lost'}${'-HP' | '-energy-point'}`;
export type ContextStatKeys = CurrentStatKeys | LostStatKeys;

export type FireRateEnum = 60 | 90 | 120;
export type CritDamageEnum = 150 | 200;
export type EnergyAmountEnum = 100 | 150 | 200;

export type TankStatValueKey =
	| keyof (ShootingStats & SurvivalStats & AttackPowerStats & AdditionalStats)
	| ContextStatKeys
	| 'movement-speed';
