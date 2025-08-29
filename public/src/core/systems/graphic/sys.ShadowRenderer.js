// System builder and context
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { RenderContext } from './contexts.js';

// Utils
import { degToRad } from '../../fomulars/angle.js';

// Components
import SpriteComponent from '../../components/graphic/com.Sprite.js';
import PositionComponent from '../../components/physics/com.Position.js';
import ShadowComponent from '../../components/graphic/com.Shadow.js';

// Constants
import { SHADOW_DELTA_LAYER } from '../../../../configs/constants/domain_constants/com.constants.js';

const ShadowRendererFactory = defineSystemFactory([SpriteComponent, PositionComponent, ShadowComponent], RenderContext)
	.withProcessor((_context, _eID, [sprite, pos, shadow], sysContext) => {
		sysContext.addRenderCallback({ layer: sprite.getLayer() + SHADOW_DELTA_LAYER, render });

		function render() {
			const { context2D } = sysContext;
			const { resource } = sprite;
			const manifest = resource.manifest;

			// Frame info
			const currentFrame = manifest['frames-position'][sprite.currentFrameIdx];
			const frameSize = manifest['frame-size'];
			const paddingRatio = manifest['padding-ratio'] || 0;
			const renderSize = manifest['render-size'] || {
				width: frameSize.width * (1 - paddingRatio),
				height: frameSize.height * (1 - paddingRatio),
			};

			const paddingX = frameSize.width * paddingRatio;
			const paddingY = frameSize.height * paddingRatio;
			const actualWidth = frameSize.width - 2 * paddingX;
			const actualHeight = frameSize.height - 2 * paddingY;

			// Source coords
			const sx = currentFrame.x + paddingX;
			const sy = currentFrame.y + paddingY;
			const sw = actualWidth;
			const sh = actualHeight;

			// Destination coords
			const dx = pos.x - renderSize.width / 2;
			const dy = pos.y - renderSize.height / 2;
			const dw = renderSize.width;
			const dh = renderSize.height;

			// Offset dựa theo góc ánh sáng
			const rad = degToRad(shadow.angle);
			const ox = Math.cos(rad) * dw * shadow.offsetX;
			const oy = Math.sin(rad) * dh * shadow.offsetY;

			// Draw shadow (clone sprite)
			context2D.save();
			context2D.globalAlpha = shadow.opacity;
			context2D.filter = `blur(${shadow.blur}px)`;

			// tô bóng với màu đen thay vì giữ màu sprite
			context2D.globalCompositeOperation = 'source-atop';
			context2D.fillStyle = 'rgba(0,0,0,1)';

			// Vẽ ảnh gốc làm mask
			context2D.drawImage(resource.sprite, sx, sy, sw, sh, dx + ox, dy + oy, dw, dh);

			// Đổ màu lên vùng mask
			context2D.fillRect(dx + ox, dy + oy, dw, dh);

			// Reset composite
			context2D.globalCompositeOperation = 'source-over';

			context2D.restore();
		}
	})
	.build();

export default ShadowRendererFactory;
