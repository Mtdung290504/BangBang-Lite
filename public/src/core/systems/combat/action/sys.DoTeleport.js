// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

import TeleportActionComponent from '../../../components/combat/action/com.Teleport.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';

const DoTeleportSystem = defineSystemFactory([TeleportActionComponent, VelocityComponent])
	.withProcessor((context, eID, [{ toX, toY }, vel]) => {
		vel.dx = toX;
		vel.dy = toY;

		// TODO: Xử lý va chạm với tường cực dày rồi mới clear

		context.removeComponent(eID, TeleportActionComponent);
	})
	.build();

export default DoTeleportSystem;
