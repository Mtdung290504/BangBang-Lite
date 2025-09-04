// System builder and context
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import { RenderContext } from './contexts.js';

// Utils
import { degToRad } from '../../fomulars/angle.js';

// Components
import MovementComponent from '../../components/combat/stats/com.Movement.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';
import PositionComponent from '../../components/physics/com.Position.js';

const SpriteRenderer = defineSystemFactory([SpriteComponent, PositionComponent], RenderContext)
	.withProcessor((context, eID, [sprite, pos], sysContext) => {
		sysContext.addRenderCallback({ layer: sprite.getLayer(), render });

		function render() {
			const { context2D } = sysContext;
			const angle = context.getComponent(eID, MovementComponent, false)?.angle ?? 0;

			const { resource } = sprite;
			const manifest = resource.manifest;

			// Get current frame position
			const currentFrame = manifest['frames-position'][sprite.currentFrameIdx];

			// Calculate frame dimensions
			const frameSize = manifest['frame-size'];
			const paddingRatio = manifest['padding-ratio'] || 0;
			const renderSize =
				manifest['render-size'] ||
				(manifest['render-size'] = {
					width: manifest['frame-size'].width * (1 - paddingRatio),
					height: manifest['frame-size'].height * (1 - paddingRatio),
				});

			// Calculate actual image size without padding
			const paddingX = frameSize.width * paddingRatio;
			const paddingY = frameSize.height * paddingRatio;
			const actualWidth = frameSize.width - 2 * paddingX;
			const actualHeight = frameSize.height - 2 * paddingY;

			// Source coordinates (skip padding)
			const sx = currentFrame.x + paddingX;
			const sy = currentFrame.y + paddingY;
			const sw = actualWidth;
			const sh = actualHeight;

			// Destination coordinates (centered at position)
			const dx = pos.x - renderSize.width / 2;
			const dy = pos.y - renderSize.height / 2;
			const dw = renderSize.width;
			const dh = renderSize.height;

			// Save canvas state
			context2D.save();

			// Translate to center of sprite for rotation
			if (angle !== 0) {
				context2D.translate(pos.x, pos.y);
				context2D.rotate(degToRad(angle));
				context2D.translate(-pos.x, -pos.y);
			}

			// Draw sprite
			context2D.drawImage(resource.sprite, sx, sy, sw, sh, dx, dy, dw, dh);

			// Render debug border
			if (sysContext.getDebugState()) {
				context2D.strokeStyle = 'white';
				context2D.lineWidth = 2;
				context2D.strokeRect(dx, dy, dw, dh);
			}

			// Restore canvas state
			context2D.restore();

			// Update frame index
			sprite.currentFrameIdx++;

			// Handle animation loop
			if (sprite.currentFrameIdx >= sprite.lastFrameIdx) {
				if (manifest.duration !== undefined) {
					// TODO: Xử lý thế nào khi animation kết thúc?
					// Đợi xóa entity hay đánh dấu và xóa SpriteComponent ở Cleanup system?
					// For now, stop at last frame
					sprite.currentFrameIdx = sprite.lastFrameIdx - 1;
				} else {
					// Loop infinitely
					sprite.currentFrameIdx = 0;
				}
			}
		}
	})
	.build();

export default SpriteRenderer;
