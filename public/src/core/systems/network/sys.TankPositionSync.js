// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../components/physics/com.Position.js';
import NetworkPositionComponent from '../../components/network/com.NetworkPosition.js';
import TankComponent from '../../components/combat/objects/com.Tank.js';

/**
 * System đồng bộ vị trí từ mạng, đồng thời tích lũy delta coords khi chưa sync
 */
const TankPositionSyncSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		const pos = context.getComponent(eID, PositionComponent);
		const networkPos = context.getComponent(eID, NetworkPositionComponent);

		// New handlers:
		if (networkPos.x && networkPos.y) {
			networkPos.targetX = networkPos.x; // Lưu target thay vì snap ngay
			networkPos.targetY = networkPos.y;
			networkPos.reset();
		}
		// Smooth movement đến target
		if (networkPos.targetX !== null && networkPos.targetY !== null) {
			const LERP_SPEED = 0.3; // Điều chỉnh này để mượt hơn/lag hơn

			pos.x += (networkPos.targetX - pos.x) * LERP_SPEED;
			pos.y += (networkPos.targetY - pos.y) * LERP_SPEED;

			// Dừng lerp khi đủ gần
			if (Math.hypot(networkPos.targetX - pos.x, networkPos.targetY - pos.y) < 1) {
				pos.x = networkPos.targetX;
				pos.y = networkPos.targetY;
				networkPos.resetTarget();
			}
		}
	})
	.build();

export default TankPositionSyncSystem;
