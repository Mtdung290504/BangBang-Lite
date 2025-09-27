import type { SurvivalStats, AttackPowerStats, AdditionalStats } from '../../../tank-manifest';
import type { ValueWithUnit } from '../../value-with-unit';
import type { DamageType } from '../../../enums/damage-types';
import type { ActionDeclaration } from '../base-action';

interface DealtDamage extends ActionDeclaration {
	action: '@apply:damage';

	source: {
		attribute:
			| keyof SurvivalStats
			| keyof Omit<AttackPowerStats, 'damage-type'>
			| keyof AdditionalStats
			| 'current-HP'
			| 'lost-HP'
			| 'current-energy-point';
		of: 'self' | 'target';
	};

	value: ValueWithUnit;

	/**
	 * Quyết định sát thương bay lên thẳng hay chéo.
	 * Mặc định: `main` (bay thẳng lên)
	 */
	'display-type'?: 'main' | 'bonus';

	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;
}

export type { DealtDamage };
