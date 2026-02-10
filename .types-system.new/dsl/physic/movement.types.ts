import { TestKey } from '../.enums';
import { ValueWithUnit } from '../.types';
import { FlightSpeedEnum, MovementSpeedEnum } from './movement.enums';

type MovementType = 'straight' | TestKey;

interface BaseMovement<T extends MovementType> {
	'move-type': T;

	/**
	 * Mặc định: `{ value: '100%', of: 'flight-speed' }`
	 */
	speed?: {
		/**@default '100%' */
		value: ValueWithUnit<true, FlightSpeedEnum | MovementSpeedEnum | (number & {})>;

		/**@default 'flight-speed' */
		of?: 'movement-speed' | 'flight-speed';
	};
}

// 2. Specific movement configs
export interface StraightMovement extends BaseMovement<'straight'> {}
export interface TestMovement extends BaseMovement<TestKey> {}
