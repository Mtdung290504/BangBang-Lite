import type { SurvivalStats, AttackPowerStats, AdditionalStats } from '../../../tank-manifest';
import type { ValueWithUnit } from '../../value-with-unit';
import type { DamageType } from '../../../enums/damage-types';

interface DealtDamage {
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

	/** Mặc định là `main` */
	type?: 'main' | 'bonus';

	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;
}

export type { DealtDamage };
