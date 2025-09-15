// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankHeadComponent from '../../../components/combat/objects/com.TankHead.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import MovementComponent from '../../../components/physics/com.Movement.js';
import InputComponent from '../../../components/input/com.Input.js';

// Utils
import * as angleFs from '../../../fomulars/angle.js';
import TankComponent from '../../../components/combat/objects/com.Tank.js';

const TankHeadRotateSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [{ tankHeadEID }]) => {
		// Lấy vị trí và movement (chứa góc xoay) của tank head
		const pos = context.getComponent(tankHeadEID, PositionComponent);
		const movement = context.getComponent(tankHeadEID, MovementComponent);

		// Lấy mouse state và chuẩn hóa tọa độ chuột trước khi tính lại góc quay
		const { inputManager } = context.getComponent(eID, InputComponent);

		// Note: Chỗ này không được, screenToWorld chạy liên tục dù đã chuẩn hóa.
		// inputManager.mouseScreenToWorld();

		const { x: mouseX, y: mouseY } = inputManager.mouseState;
		const dx = mouseX - pos.x;
		const dy = mouseY - pos.y;
		movement.angle = angleFs.radToDeg(Math.atan2(dy, dx));
	})
	.build();

export default TankHeadRotateSystem;
