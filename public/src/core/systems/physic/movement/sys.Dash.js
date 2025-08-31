// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankComponent from '../../../components/combat/objects/com.Tank.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';
import DashComponent from '../../../components/combat/action/com.Dash.js';
import MovementComponent from '../../../components/combat/stats/com.Movement.js';

// Constants
import { SPEED_CALCULATION_CONSTANT } from '../../../../../configs/constants/domain_constants/com.constants.js';

// Utils
import * as angleFs from '../../../fomulars/angle.js';

/**
 * System xử lý dash cho Tank.
 * *Lưu ý phải chạy sau TankMovement
 */
const DashSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		if (!context.hasComponent(eID, DashComponent)) return;

		const dash = context.getComponent(eID, DashComponent);
		const velocity = context.getComponent(eID, VelocityComponent);
		const movement = context.getComponent(eID, MovementComponent);

		// Tính vector hướng từ góc dash
		const rad = angleFs.degToRad(dash.angle);
		const dx = Math.cos(rad);
		const dy = Math.sin(rad);

		// Tính khoảng cách cần đi trong frame này
		const stepDistance = dash.speed * SPEED_CALCULATION_CONSTANT;

		// Nếu vượt quá range còn lại thì clamp lại
		const moveDist = Math.min(stepDistance, dash.remainingRange);

		// Ghi vận tốc theo khoảng cách hợp lệ
		velocity.dx = dx * moveDist;
		velocity.dy = dy * moveDist;

		// Khóa góc quay (tank không xoay trong khi dash)
		movement.angle = dash.angle;

		// Giảm range còn lại
		dash.remainingRange -= moveDist;

		// Hết range thì remove DashComponent
		if (dash.remainingRange <= 0) {
			context.removeComponent(eID, DashComponent);
		}
	})
	.build();

export default DashSystem;
