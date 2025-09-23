// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankComponent from '../../../components/combat/objects/com.Tank.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';

const TankStopMovementSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		context.getComponent(eID, VelocityComponent).reset();
	})
	.build();

export default TankStopMovementSystem;
