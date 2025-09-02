// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankHeadComponent from '../../../components/combat/objects/com.TankHead.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import MovementComponent from '../../../components/combat/stats/com.Movement.js';
import InputComponent from '../../../components/input/com.Input.js';

// Utils
import * as angleFs from '../../../fomulars/angle.js';

const TankHeadRotateSystem = defineSystemFactory([TankHeadComponent])
	.withProcessor((context, eID, [{ tankEID }]) => {
		// Lấy vị trí và movement (chứa góc xoay)
		const pos = context.getComponent(eID, PositionComponent);
		const movement = context.getComponent(eID, MovementComponent);

		// Lấy mouse state và chuẩn hóa tọa độ chuột trước khi tính lại góc quay
		const { inputManager } = context.getComponent(tankEID, InputComponent);

		// Note: Chỗ này không được, screenToWorld chạy liên tục dù đã chuẩn hóa.
		// inputManager.mouseScreenToWorld();

		const { x: mouseX, y: mouseY } = inputManager.mouseState;

		const dx = mouseX - pos.x;
		const dy = mouseY - pos.y;

		movement.angle = angleFs.radToDeg(Math.atan2(dy, dx));
	})
	.build();

export default TankHeadRotateSystem;
