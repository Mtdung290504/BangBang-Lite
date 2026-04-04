import { ValueResolver } from '../runtime.types';

type MovementType = 'straight' | 'tracking';

interface BaseMovement<T extends MovementType> {
	'move-type': T;

	/**
	 * Mặc định: `{ value: '100%', of: 'flight-speed' }`
	 */
	speed?: ValueResolver;
}

// 2. Specific movement configs
export interface StraightMovement extends BaseMovement<'straight'> {}
export interface TrackingMovement extends BaseMovement<'tracking'> {}
