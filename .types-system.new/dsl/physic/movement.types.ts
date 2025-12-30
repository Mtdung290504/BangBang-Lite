import { TestKey } from '../.enums';
import { FlightSpeedEnum, MovementSpeedEnum } from './movement.enums';

type MovementType = 'straight' | TestKey;

interface BaseMovement<T extends MovementType> {
	'move-type': T;
}

// 2. Specific movement configs
export interface StraightMovement extends BaseMovement<'straight'> {
	speed: FlightSpeedEnum | MovementSpeedEnum;
}

export interface TestMovement extends BaseMovement<TestKey> {
	speed: FlightSpeedEnum | MovementSpeedEnum;
}
