export default class SpriteComponent {
	/**
	 * @param {{ storageKey: string, manifest: import('.types/sprite-manifest.js').SpriteManifest }} resource - storageKey để lấy image từ storage, manifest để đặc tả sprite
	 * @param {{ x: number, y: number }} position - Vị trí draw sprite
	 * @param {number} rotateAngle - Góc quay sprite (nếu có)
	 */
	constructor(resource, position, rotateAngle = 0) {
		this.resource = resource;
		this.position = position;
		this.rotateAngle = rotateAngle;

		this.currentFrame = 0;
	}
}
