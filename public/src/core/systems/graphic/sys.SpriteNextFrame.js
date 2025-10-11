// System builder and context
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import SpriteComponent from '../../components/graphic/com.Sprite.js';

/**
 * Di chuyển đến frame tiếp theo của sprite
 */
const SpriteNextFrameSystem = defineSystemFactory([SpriteComponent])
	.withProcessor((_context, _eID, [sprite]) => {
		sprite.currentFrameIdx++;

		// Handle animation loop
		if (sprite.currentFrameIdx >= sprite.lastFrameIdx) {
			if (sprite.resource.manifest.duration !== undefined) {
				// TODO: Xử lý thế nào khi animation kết thúc?
				// Đợi xóa entity hay đánh dấu và xóa SpriteComponent ở Cleanup system?
				// For now, stop at last frame
				sprite.currentFrameIdx = sprite.lastFrameIdx - 1;
			} else {
				// Loop infinitely
				sprite.currentFrameIdx = 0;
			}
		}
	})
	.build();

export default SpriteNextFrameSystem;
