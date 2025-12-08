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
	 * Quyết định hiển thị số bay lên thẳng hay chéo.
	 * Mặc định: `main` (bay thẳng lên)
	 */
	'display-type'?:
		| 'main'
		| 'bonus'

		// fallback, bay về hướng kia so với `bonus`
		| (string & {});

	/** Mặc định kế thừa từ tank */
	'damage-type'?: DamageType;

	/** Cờ để trừ damage trong một số trường hợp, ví dụ khi đạn nảy hay xuyên */
	'is-main-damage'?: boolean;
}

export type { DealtDamage };
