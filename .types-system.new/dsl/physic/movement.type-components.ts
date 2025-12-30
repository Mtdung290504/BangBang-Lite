import { StraightMovement, TestMovement } from './movement.types';

export interface Movable {
	movement: StraightMovement | TestMovement;
}
