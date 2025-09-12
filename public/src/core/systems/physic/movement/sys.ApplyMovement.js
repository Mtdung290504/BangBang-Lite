// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../../components/physics/com.Position.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';
import VelocityHistoryComponent from '../../../components/network/com.VelocityHistory.js';

const ApplyMovementSystem = defineSystemFactory([PositionComponent, VelocityComponent])
	.withProcessor((context, eID, [pos, vel]) => {
		// New handler
		if (vel.dx !== 0 || vel.dy !== 0) {
			// Thêm timestamp và lưu delta vào history (nếu có component)
			const history = context.getComponent(eID, VelocityHistoryComponent, false);
			if (history) history.saveDelta(vel.dx, vel.dy, Date.now());
		}

		pos.x += vel.dx;
		pos.y += vel.dy;
		vel.reset();
	})
	.build();

export default ApplyMovementSystem;
