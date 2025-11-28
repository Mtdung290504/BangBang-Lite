import { TestKey } from '../../common.enums';
import { FlightSpeedEnum, MovementSpeedEnum } from './movement.enums';

// 1. Define base movement types
type MovementType = 'straight' | TestKey;

interface BaseMovement<T extends MovementType> {
	type: T;
}

// 2. Specific movement configs
interface StraightMovement extends BaseMovement<'straight'> {
	speed: FlightSpeedEnum | MovementSpeedEnum;
}

interface TestMovement extends BaseMovement<'*for-test:do-not-use-this-key'> {
	speed: FlightSpeedEnum | MovementSpeedEnum;
}

// 3. Union type
export interface Movement {
	movement: StraightMovement | TestMovement;
}

// 4. Skill interface
// interface CreateProjectileAction
//   extends ActionDeclaration<'create', 'projectile'>,
//           ... {
//   movement: Movement;  // ← Single field, nhiều options
// }
