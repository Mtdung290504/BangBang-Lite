// System builder and context
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { RenderContext } from './contexts.js';

// Utils
import { degToRad } from '../../fomulars/angle.js';

// Components
import MovementComponent from '../../components/combat/stats/com.Movement.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';
import PositionComponent from '../../components/physics/com.Position.js';
import ShadowComponent from '../../components/graphic/com.Shadow.js';

const SpriteRenderer = defineSystemFactory([SpriteComponent, PositionComponent], RenderContext)
	.withProcessor((context, eID, [sprite, pos], sysContext) => {
		sysContext.addRenderCallback({ layer: sprite.getLayer(), render });

		function render() {
			const { context2D } = sysContext;

			// Sử dụng movement component nếu sprite cần xoay, không thì không đặt
			const movementComponent = context.getComponent(eID, MovementComponent, false);
			const angle = movementComponent?.angle ?? 0;

			// Sử dụng cached frame data
			const frameData = sprite.getCurrentFrameData();

			// Sử dụng precomputed destination coordinates
			const destCoords = sprite.getDestinationCoords(pos);
			const { width: renderW, height: renderH } = destCoords.renderSize;

			context2D.save();

			// Nếu góc quay khác 0 mới xử lý xoay
			if (angle !== 0) {
				context2D.translate(pos.x, pos.y);
				context2D.rotate(degToRad(angle));
				context2D.translate(-pos.x, -pos.y);
			}

			// Render shadow nếu là tank
			const shadow = context.getComponent(eID, ShadowComponent, false);
			if (shadow) {
				const { alpha, blur, offsetRatioX, offsetRatioY } = shadow;
				context2D.shadowColor = `rgba(0, 0, 0, ${alpha})`;
				context2D.shadowBlur = blur;
				context2D.shadowOffsetX = renderW * offsetRatioX;
				context2D.shadowOffsetY = renderH * offsetRatioY;
			}

			context2D.drawImage(
				sprite.resource.sprite,
				frameData.sx,
				frameData.sy,
				frameData.sw,
				frameData.sh,
				destCoords.dx,
				destCoords.dy,
				destCoords.dw,
				destCoords.dh
			);

			// Vẽ border nếu trong mode debug
			if (sysContext.getDebugState()) {
				context2D.strokeStyle = 'white';
				context2D.lineWidth = 2;
				context2D.strokeRect(destCoords.dx, destCoords.dy, destCoords.dw, destCoords.dh);
			}

			context2D.restore();
		}
	})
	.build();

export default SpriteRenderer;
