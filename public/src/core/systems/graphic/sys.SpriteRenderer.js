import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';
import SpeedComponent from '../../components/combat/com.Speed.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';
import { PositionComponent } from '../../components/physics/com.Position.js';
import { RenderContext } from './contexts.js';

const RenderSystemFactory = defineSystemFactory([SpriteComponent], RenderContext)
	.withProcessor((context, eID, [sprite], sysContext) => {
		const { context2D } = sysContext;
		const pos = context.getComponent(eID, PositionComponent);
		const { angle } = context.getComponent(eID, SpeedComponent);
		const {} = sprite;

		// Render debug border
		if (sysContext.getDebugState()) {
		}
	})
	.build();

export default RenderSystemFactory;
