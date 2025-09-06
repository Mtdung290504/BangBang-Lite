// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../../components/physics/com.Position.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';
import NetworkPositionComponent from '../../../components/network/com.NetworkPosition.js';
import VelocityHistoryComponent from '../../../components/network/com.VelocityHistory.js';
import TankComponent from '../../../components/combat/objects/com.Tank.js';

/**
 * System đồng bộ vị trí từ mạng, đồng thời tích lũy delta coords khi chưa sync
 */
const TankPositionSyncSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		const pos = context.getComponent(eID, PositionComponent);
		const vel = context.getComponent(eID, VelocityComponent);
		const velHistory = context.getComponent(eID, VelocityHistoryComponent);
		const networkPos = context.getComponent(eID, NetworkPositionComponent);

		if (networkPos.x && networkPos.y) {
			pos.x = networkPos.x + velHistory.dxFromLastSync;
			pos.y = networkPos.y + velHistory.dyFromLastSync;
			networkPos.reset(); // Đặt các tọa độ về null
			velHistory.reset(); // Đặt các delta coords về 0
		}

		// velHistory.dxFromLastSync += vel.dx;
		// velHistory.dxFromLastSync += vel.dy;
	})
	.build();

export default TankPositionSyncSystem;
