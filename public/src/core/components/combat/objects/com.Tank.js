export default class TankComponent {
	/**
	 * @param {number} tankID
	 * @param {number} skinID
	 * @param {(spriteKey: string) => {
	 * 		sprite: HTMLImageElement
	 * 		manifest: import('.types/src/graphic/graphics.js').SpriteManifest
	 * }} getSprite
	 */
	constructor(tankID, skinID, getSprite) {
		this.tankID = tankID;
		this.skinID = skinID;
		this.tankHeadEID = -1;
		this.getSprite = getSprite;
	}
}
