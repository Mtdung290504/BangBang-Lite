export default class SpriteComponent {
	/**
	 * @param {Object} resource
	 * @param {HTMLImageElement} resource.sprite - Sprite sheet
	 * @param {import('.types/sprite-manifest').SpriteManifest} resource.manifest - Đặc tả sprite
	 */
	constructor(resource) {
		// Note, không có Position với angle vì sử dụng các Component đó của parent
		this.resource = resource;
		this.currentFrameID = 0;
		this.lastFrameID = this.resource.manifest['frames-position'].length;
	}
}
