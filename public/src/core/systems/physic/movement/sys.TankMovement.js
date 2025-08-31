// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankComponent from '../../../components/combat/objects/com.Tank.js';
import MovementComponent from '../../../components/combat/stats/com.Movement.js';
import InputComponent from '../../../components/input/com.Input.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';

// Constants
import {
	ROTATE_CALCULATION_CONSTANT,
	SPEED_CALCULATION_CONSTANT,
} from '../../../../../configs/constants/domain_constants/com.constants.js';
import { ACTIONS_KEYS } from '../../../../../configs/action-keys.js';

// Utils
import * as angleFs from '../../../fomulars/angle.js';

const TankMovementSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		// Lấy input manager để đọc trạng thái các phím điều khiển
		const { inputManager } = context.getComponent(eID, InputComponent);
		const actions = inputManager.actionState;

		// Xác định vector hướng di chuyển
		let rawDx = (actions[ACTIONS_KEYS['RIGHT']] ? 1 : 0) - (actions[ACTIONS_KEYS['LEFT']] ? 1 : 0);
		let rawDy = (actions[ACTIONS_KEYS['DOWN']] ? 1 : 0) - (actions[ACTIONS_KEYS['UP']] ? 1 : 0);

		// Độ dài vector di chuyển.
		// *Nếu vector di chuyển khác 0 thì mới di chuyển, không thì bỏ qua xử lý
		const moveLength = Math.hypot(rawDx, rawDy);
		if (moveLength === 0) return;

		// Lấy góc quay hiện tại và tốc độ di chuyển của tank
		const movement = context.getComponent(eID, MovementComponent);
		const { angle, speed } = movement;

		// Component chứa vector vận tốc (dx, dy), sẽ được system này cập nhật, cập nhật vị trí giao cho system khác
		const velocity = context.getComponent(eID, VelocityComponent);

		// *Tính vector vận tốc thực:
		const speedVal = speed * SPEED_CALCULATION_CONSTANT;

		// Chuẩn hóa vector hướng di chuyển về độ dài 1 (Tránh hiện tượng đi chéo nhanh hơn)
		// Và nhân với speed và SPEED_CALCULATION_CONSTANT để ra vận tốc thực (*Đây chính là vector vận tốc trong frame này)
		velocity.dx = (rawDx / moveLength) * speedVal;
		velocity.dy = (rawDy / moveLength) * speedVal;

		// *Xử lý xoay thân tank:
		const targetAngle = angleFs.radToDeg(Math.atan2(velocity.dy, velocity.dx));
		const rotateSpeed = speedVal / ROTATE_CALCULATION_CONSTANT;

		// Hiệu số góc giữa góc mục tiêu và góc hiện tại
		let angleDiff = angleFs.normalize(targetAngle - angle);
		// Chuyển angleDiff về khoảng [-180, 180] để xác định chiều xoay ngắn hơn
		angleDiff = ((angleDiff + 540) % 360) - 180;

		// Cập nhật góc quay thân tank
		// - Nếu chênh lệch nhỏ hơn rotateSpeed thì gán luôn = targetAngle (để không rung lắc).
		// - Nếu chênh lệch lớn thì xoay dần theo rotateSpeed, theo hướng ngắn nhất.
		if (Math.abs(angleDiff) < rotateSpeed) {
			movement.angle = targetAngle;
		} else {
			movement.angle += rotateSpeed * Math.sign(angleDiff);
		}

		// Chuẩn hóa góc quay thân tank về góc thuộc [0, 360] (*Đây chính là góc quay của tank trong frame này)
		movement.angle = angleFs.normalize(movement.angle);
	})
	.build();

export default TankMovementSystem;
