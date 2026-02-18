import { StraightMovement, TestMovement } from './movement.types';

export interface Movable {
	/** Không khai báo thì đứng im */
	movement?: StraightMovement | TestMovement;
}
