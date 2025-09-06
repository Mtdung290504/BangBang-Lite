// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../../components/physics/com.Position.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';

const ApplyMovementSystem = defineSystemFactory([PositionComponent, VelocityComponent])
	.withProcessor((context, eID, [pos, vel]) => {
		pos.x += vel.dx;
		pos.y += vel.dy;
		vel.reset();
	})
	.build();

export default ApplyMovementSystem;
