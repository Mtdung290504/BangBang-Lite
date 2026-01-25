import { ValueWithUnit } from '../.types';
import { TankStatValueKey } from '../entity/tank/.enums';

export interface StatValue<T extends TankStatValueKey = TankStatValueKey> {
	'value-from': {
		attribute: T;
		value: ValueWithUnit;

		/** Mặc định: `target` */
		of?: 'self' | 'target';
	};
}
