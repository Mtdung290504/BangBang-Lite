import { StraightMovement, TrackingMovement } from './movement.types';

type MovementUnion = StraightMovement | TrackingMovement;
export interface Movable<MovementType = MovementUnion> {
	/** Không khai báo thì đứng im */
	movement?: MovementType;
}
