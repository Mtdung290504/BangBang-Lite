import type { SurvivalStats, AttackPowerStats, AdditionalStats } from '../../tank-manifest';
import type { ValueWithUnit } from '../../utils-types';

interface CreateDamage {
	name: 'dealt-damage';
	source: {
		attribute:
			| keyof SurvivalStats
			| keyof AttackPowerStats
			| keyof AdditionalStats
			| 'current-HP'
			| 'lost-HP'
			| 'current-energy-point';
		of: 'self' | 'target';
	};
	value: ValueWithUnit;
}

type CreateDamageAction = CreateDamage;

export type { CreateDamageAction };
