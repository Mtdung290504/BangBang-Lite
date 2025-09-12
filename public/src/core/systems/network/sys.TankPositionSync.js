// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../components/physics/com.Position.js';
import NetworkPositionComponent from '../../components/network/com.NetworkPosition.js';
import TankComponent from '../../components/combat/objects/com.Tank.js';
import VelocityHistoryComponent from '../../components/network/com.VelocityHistory.js';

/**
 * System đồng bộ vị trí từ mạng, đồng thời tích lũy delta coords khi chưa sync
 */
const TankPositionSyncSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		const pos = context.getComponent(eID, PositionComponent);
		const networkPos = context.getComponent(eID, NetworkPositionComponent);
		const history = context.getComponent(eID, VelocityHistoryComponent);

		// Xử lý sync từ network (new handler)
		if (networkPos.x !== null && networkPos.y !== null && networkPos.timestamp !== null) {
			// Tìm timestamp gần nhất trong history
			const nearestTimestamp = history.findNearestTimestamp(networkPos.timestamp);

			if (nearestTimestamp !== null) {
				// Replay: Cộng tất cả delta sau timestamp sync
				const replayDelta = history.getDeltaFromTimestamp(networkPos.timestamp);
				networkPos.targetX = networkPos.x + replayDelta.dx;
				networkPos.targetY = networkPos.y + replayDelta.dy;

				// Cập nhật lastSyncTimestamp
				history.lastSyncTimestamp = networkPos.timestamp;
			} else {
				// Fallback: Nếu không có history, dùng lerp như cũ
				networkPos.targetX = networkPos.x;
				networkPos.targetY = networkPos.y;
			}

			// Reset network data
			networkPos.reset();
		}

		// Smooth lerp cho trường hợp fallback (old handler)
		if (networkPos.targetX !== null && networkPos.targetY !== null) {
			const LERP_SPEED = 0.3;

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
