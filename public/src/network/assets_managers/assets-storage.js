/**
 * Module lưu trữ asset đã load vào bộ nhớ (storage)
 * (Storage module for loaded assets)
 *
 * - Sprites: Object, key dạng `${tankID}_${skinID}_${spriteKey}`
 * - Map icons: Map
 * - Map assets (background, scenes): Map
 */

/**
 * Lưu sprite, key dạng `${tankID}_${skinID}_${spriteKey}`
 * @type {Record<string, { sprite: HTMLImageElement, manifest: import('.types/sprite-manifest.js').SpriteManifest }>}
 */
const sprites = {};

/**
 * Lưu icon của map, key là mapID
 * @type {Map<number | string, HTMLImageElement>}
 */
const mapIcons = new Map();

/**
 * Lưu background và scenes của map, key là mapID
 * @type {Map<number | string, { background: HTMLImageElement, scenes: HTMLImageElement | null }>}
 */
const mapAssets = new Map();

/**
 * Thêm sprite vào storage
 *
 * @param {number | string} tankID  ID của tank
 * @param {number | string} skinID  ID của skin
 * @param {string} spriteKey  Tên sprite
 * @param {{ sprite: HTMLImageElement, manifest: import('.types/sprite-manifest.js').SpriteManifest }} spriteData  Dữ liệu sprite và manifest
 */
export function setSprite(tankID, skinID, spriteKey, spriteData) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	sprites[key] = spriteData;
}

/**
 * Lấy sprite từ storage
 *
 * @param {number | string} tankID
 * @param {number | string} skinID
 * @param {string} spriteKey
 *
 * @returns {{ sprite: HTMLImageElement, manifest: import('.types/sprite-manifest.js').SpriteManifest } | undefined}
 */
export function getSprite(tankID, skinID, spriteKey) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	return sprites[key];
}

/**
 * Kiểm tra sprite đã tồn tại chưa
 *
 * @param {number | string} tankID
 * @param {number | string} skinID
 * @param {string} spriteKey
 *
 * @returns {boolean}  true nếu đã tồn tại
 */
export function hasSprite(tankID, skinID, spriteKey) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	return key in sprites;
}

/**
 * Lấy một hàm builder cho phép gọi sprite theo spriteKey
 * (Prepared function for quick sprite access)
 *
 * @param {number | string} tankID
 * @param {number | string} skinID
 *
 * @returns {(spriteKey: string) => { sprite: HTMLImageElement, manifest: import('.types/sprite-manifest.js').SpriteManifest } | undefined}
 */
export function getSpriteKeyBuilder(tankID, skinID) {
	return function (spriteKey) {
		return getSprite(tankID, skinID, spriteKey);
	};
}

/**
 * Thêm icon map
 *
 * @param {number | string} mapID
 * @param {HTMLImageElement} img
 */
export function setMapIcon(mapID, img) {
	mapIcons.set(mapID, img);
}

/**
 * Lấy icon map
 *
 * @param {number | string} mapID
 * @returns {HTMLImageElement|undefined}
 */
export function getMapIcon(mapID) {
	return mapIcons.get(mapID);
}

/**
 * Thêm asset map (background, scenes)
 *
 * @param {number | string} mapID
 * @param {{ background: HTMLImageElement, scenes: HTMLImageElement | null }} assets
 */
export function setMapAssets(mapID, assets) {
	mapAssets.set(mapID, assets);
}

/**
 * Lấy asset map
 *
 * @param {number | string} mapID
 * @returns {{ background: HTMLImageElement, scenes: HTMLImageElement | null }|undefined}
 */
export function getMapAssets(mapID) {
	return mapAssets.get(mapID);
}
