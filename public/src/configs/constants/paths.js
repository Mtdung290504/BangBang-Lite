export const SPRITE_BASE_PATH = '/assets/images/tanks';
const SPRITE_MANIFEST_FILE_NAME = 'manifest.json';
const SPRITE_FILE_NAME = 'sprite.webp';

export const MAP_BASE_PATH = '/assets/images/maps';
const MAP_BACKGROUND_LAYER_FILE_NAME = 'background-layer.webp';
const MAP_SCENES_LAYER_FILE_NAME = 'scenes-layer.webp';
const MAP_ICON_FILE_NAME = 'icon.webp';

export const MAP_MANIFEST_BASE_PATH = '/assets/battle_manifests/map_manifests';

export const SKILL_MANIFEST_PATH = '/assets/battle_manifests/tank_manifests';
const TANK_MANIFEST_FILE_NAME = 'tank-manifest.js';
const SKILL_DESCRIPTION_FILE_NAME = 'skill-description.json';

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
	 * Lấy đường dẫn các layer của 1 map và manifest path của map đó
	 * @param {number} mapID - ID của map
	 */
	map(mapID) {
		const path = `${MAP_BASE_PATH}/${mapID}/`;
		return {
			path,
			manifestBasePath: MAP_MANIFEST_BASE_PATH,
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
			get manifestPath() {
				return MAP_MANIFEST_BASE_PATH + `${mapID}.json`;
			},
		};
	},

	/**
	 * Lấy đường dẫn liên quan đến tank manifest
	 * @param {number} tankID
	 */
	tankManifest(tankID) {
		const path = `${SKILL_MANIFEST_PATH}/${tankID}/`;

		return {
			path,

			get manifestPath() {
				return path + TANK_MANIFEST_FILE_NAME;
			},
			get skillDescriptionPath() {
				return path + SKILL_DESCRIPTION_FILE_NAME;
			},
		};
	},
};
