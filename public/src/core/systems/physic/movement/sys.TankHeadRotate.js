// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankHeadComponent from '../../../components/combat/objects/com.TankHead.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import MovementComponent from '../../../components/combat/stats/com.Movement.js';

// Utils
import * as angleFs from '../../../fomulars/angle.js';
import InputComponent from '../../../components/input/com.Input.js';

const TankHeadRotateSystem = defineSystemFactory([TankHeadComponent])
	.withProcessor((context, eID, [{ tankEID }]) => {
		const pos = context.getComponent(tankEID, PositionComponent);
		const movement = context.getComponent(eID, MovementComponent);

		const { inputManager } = context.getComponent(tankEID, InputComponent);
		const { x: mouseX, y: mouseY } = inputManager.mouseState;

		const dx = mouseX - pos.x;
		const dy = mouseY - pos.y;

		movement.angle = angleFs.radToDeg(Math.atan2(dy, dx));
	})
	.build();

export default TankHeadRotateSystem;
