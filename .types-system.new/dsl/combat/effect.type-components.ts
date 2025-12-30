import { ValueWithUnit } from '../.types';
import { TankStatValueKey } from '../entity/tank/.enums';

export interface StatValue<T extends TankStatValueKey = TankStatValueKey> {
	'value-from': {
		attribute: T;

		/** Mặc định: `target` */
		of?: 'self' | 'target';

		value: ValueWithUnit;
	};
}
