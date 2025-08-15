export const SPRITE_BASE_PATH = '/assets/images/tanks';
const SPRITE_MANIFEST_FILE_NAME = 'manifest.json';
const SPRITE_FILE_NAME = 'sprite.webp';

export const MAP_BASE_PATH = '/assets/images/maps';
const MAP_BACKGROUND_LAYER_FILE_NAME = 'background-layer.webp';
const MAP_SCENES_LAYER_FILE_NAME = 'scenes-layer.webp';
const MAP_ICON_FILE_NAME = 'icon.webp';

/**
 * Chứa các hàm builder lấy về các path cần thiết
 */
export const ASSETS_PATH = {
	/**
	 * Lấy đường dẫn sprite cho 1 tank + skin + sprite key kèm tên file, path nếu cần trong tương lai
	 *
	 * @param {number} tankID - ID của tank
	 * @param {string} spriteKey - Tên key của sprite
	 * @param {number} skinID - ID của skin
	 *
	 * @returns {{
	 * 		path: string,
	 * 		manifest: string,
	 * 		sprite: string,
	 * 		manifestPath: string,
	 * 		spritePath: string
	 * }}
	 */
	sprite(tankID, spriteKey, skinID = 0) {
		const path = `${SPRITE_BASE_PATH}/${tankID}/${skinID}/${spriteKey}/`;
		return {
			path,
			manifest: SPRITE_MANIFEST_FILE_NAME,
			sprite: SPRITE_FILE_NAME,

			get manifestPath() {
				return path + SPRITE_MANIFEST_FILE_NAME;
			},
			get spritePath() {
				return path + SPRITE_FILE_NAME;
			},
		};
	},

	/**
	 * Lấy đường dẫn các layer của 1 map kèm tên file, path
	 *
	 * @param {number} mapID - ID của map
	 *
	 * @returns {{
	 * 		path: string
	 * 		background: string
	 * 		scenes: string
	 * 		icon: string
	 * 		backgroundPath: string
	 * 		scenesPath: string
	 * 		iconPath: string
	 * }}
	 */
	map(mapID) {
		const path = `${MAP_BASE_PATH}/${mapID}/`;
		return {
			path,
			background: MAP_BACKGROUND_LAYER_FILE_NAME,
			scenes: MAP_SCENES_LAYER_FILE_NAME,
			icon: MAP_ICON_FILE_NAME,

			get backgroundPath() {
				return path + MAP_BACKGROUND_LAYER_FILE_NAME;
			},
			get scenesPath() {
				return path + MAP_SCENES_LAYER_FILE_NAME;
			},
			get iconPath() {
				return path + MAP_ICON_FILE_NAME;
			},
		};
	},
};
