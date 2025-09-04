export default class SpriteComponent {
	/**
	 * Component lưu trạng thái và tài nguyên sprite
	 *
	 * @param {Object} resource
	 * @param {HTMLImageElement} resource.sprite - Sprite sheet
	 * @param {import('.types/src/graphic/graphics').SpriteManifest} resource.manifest - Đặc tả sprite
	 * @param {() => number} [getParentLayer]
	 */
	constructor(resource, getParentLayer) {
		// Note, không có Position với angle vì sử dụng các Component đó của parent
		this.resource = resource;

		this.currentFrameIdx = 0;
		this.lastFrameIdx = this.resource.manifest['frames-position'].length;

		const layerConfig = resource.manifest['layer-config'];
		if (!layerConfig) {
			/**@type {() => number} */
			this.getLayer = () => 0;
		} else {
			if (layerConfig.type === 'static') this.getLayer = () => layerConfig.value;
			else if (layerConfig.type === 'relative') {
				if (!getParentLayer || typeof getParentLayer !== 'function')
					throw new TypeError('> [SpriteComponent] Invalid [getParentLayer]');
				this.getLayer = () => layerConfig.value + getParentLayer();
			}
		}
	}
}
