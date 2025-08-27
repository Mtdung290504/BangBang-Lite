export default class SpriteComponent {
	/**
	 * Component lưu trạng thái và tài nguyên sprite
	 *
	 * @param {Object} resource
	 * @param {HTMLImageElement} resource.sprite - Sprite sheet
	 * @param {import('.types/sprite-manifest').SpriteManifest} resource.manifest - Đặc tả sprite
	 */
	constructor(resource) {
		// Note, không có Position với angle vì sử dụng các Component đó của parent
		this.resource = resource;
		this.lastFrameIdx = this.resource.manifest['frames-position'].length;
		this.currentFrameIdx = 0;
	}
}
