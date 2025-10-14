/**
 * Module lưu trữ asset đã load vào bộ nhớ (storage)
 * (Storage module for loaded assets)
 *
 * - Sprites: Object, key dạng `${tankID}_${skinID}_${spriteKey}`
 * - Map icons: Map
 * - Map assets (background, scenes): Map
 */

/**
 * @typedef {import('.types-system/src/graphic/graphics').SpriteManifest} SpriteManifest
 * @typedef {import('.types-system/dsl/tank-manifest.js').TankManifest} TankManifest
 * @typedef {import('.types-system/dsl/skill-manifest').SkillManifest} SkillManifest
 * @typedef {import('.types-system/dsl/map-manifest.js').MapManifest} MapManifest
 * @typedef {import('assets/battle_manifests/skill_sp_manifests.js')['default']} SkillSPManifests
 */

const LOG_PREFIX = '> [net.asset-storage]';

/**
 * Lưu sprite, key dạng `${tankID}_${skinID}_${spriteKey}`
 * @type {Record<string, { sprite: HTMLImageElement, manifest: SpriteManifest }>}
 */
export const sprites = {};

/**
 * Lưu icon của map, key là mapID
 * @type {Map<number, HTMLImageElement>}
 */
export const mapIcons = new Map();

/**
 * Lưu background và scenes của map, key là mapID
 * @type {Map<number, { background: HTMLImageElement, scenes: HTMLImageElement | null }>}
 */
export const mapAssets = new Map();

/**
 * Lưu tank manifest như chỉ số, skills, key là tankID
 * @type {Map<number, {
 * 		stats?: TankManifest
 * 		skills?: SkillManifest
 * 		skillDescription?: any
 * }>}
 */
export const tankManifests = new Map();

/**
 * Lưu map manifest
 * @type {Map<number, MapManifest>}
 */
export const mapManifests = new Map();

/**
 * Lưu assetIDs sau preload phase 1
 * @type {{ mapIDs: number[], tankIDs: number[] }}
 */
export let assetIDs;

/**
 * Đặt assetID trong quá trình preload, hàm này như một bước thiết lập và chỉ có thể gọi 1 lần.
 *
 * @param {number[]} mapIDs
 * @param {number[]} tankIDs
 */
export function setAssetIDs(mapIDs, tankIDs) {
	if (!assetIDs) {
		assetIDs = { mapIDs, tankIDs };
		return;
	}
	console.warn('> [AssetsStorage] Asset IDs can only be set once, subsequent function calls are useless.');
}

/**
 * Thêm sprite vào storage
 *
 * @param {number} tankID - ID của tank
 * @param {number} skinID - ID của skin
 * @param {string} spriteKey - Tên sprite
 * @param {{ sprite: HTMLImageElement, manifest: SpriteManifest }} spriteData  Dữ liệu sprite và manifest
 */
export function setSprite(tankID, skinID, spriteKey, spriteData) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	sprites[key] = spriteData;
}

/**
 * Lấy sprite từ storage
 *
 * @param {number} tankID
 * @param {number} skinID
 * @param {string} spriteKey
 */
export function getSprite(tankID, skinID, spriteKey) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	const result = sprites[key];
	if (result) return result;

	throw new Error(msg(`Sprite:[${key}] not found`));
}

/**
 * Lấy một hàm builder cho phép gọi sprite theo spriteKey
 * (Prepared function for quick sprite access)
 *
 * @param {number} tankID
 * @param {number} skinID
 */
export function getSpriteKeyBuilder(tankID, skinID) {
	return (spriteKey = '') => getSprite(tankID, skinID, spriteKey);
}

/**
 * Kiểm tra sprite đã tồn tại chưa (Dùng cho loader chứ trong battle thường không cần)
 *
 * @param {number} tankID
 * @param {number} skinID
 * @param {string} spriteKey
 */
export function hasSprite(tankID, skinID, spriteKey) {
	const key = `${tankID}_${skinID}_${spriteKey}`;
	return key in sprites;
}

/**
 * Thêm icon map
 *
 * @param {number} mapID
 * @param {HTMLImageElement} img
 */
export function setMapIcon(mapID, img) {
	mapIcons.set(mapID, img);
}

/**
 * Lấy icon map
 *
 * @param {number} mapID
 * @throws {Error} Khi không tồn tại mapIcon nào tương ứng với ID truyền vào
 */
export function getMapIcon(mapID) {
	const mapIcon = mapIcons.get(mapID);
	if (mapIcon) return mapIcon;

	throw new Error(`Map:[${mapID}] icon does not exist`);
}

/**
 * Thêm asset map (background, scenes)
 *
 * @param {number} mapID
 * @param {{ background: HTMLImageElement, scenes: HTMLImageElement | null }} assets
 */
export function setMapAssets(mapID, assets) {
	mapAssets.set(mapID, assets);
}

/**
 * Lấy asset map
 * @param {number} mapID
 */
export function getMapAssets(mapID) {
	return mapAssets.get(mapID);
}

/**
 * @param {number} mapID
 * @param {MapManifest} manifest
 */
export function setMapManifest(mapID, manifest) {
	mapManifests.set(mapID, manifest);
}

/**
 * @param {number} mapID
 */
export function getMapManifest(mapID) {
	return mapManifests.get(mapID);
}

/**
 * @param {number} mapID
 */
export function hasMapManifest(mapID) {
	return mapManifests.has(mapID);
}

/**
 * Thêm tank manifest (stats, skills)
 *
 * @param {number} tankID
 * @param {{ stats: TankManifest, skills: SkillManifest }} manifests
 */
export function setTankManifests(tankID, manifests) {
	const existing = tankManifests.get(tankID);
	if (existing) {
		existing.stats = manifests.stats;
		existing.skills = manifests.skills;
	} else {
		tankManifests.set(tankID, {
			stats: manifests.stats,
			skills: manifests.skills,
		});
	}
}

/**
 * Thêm skill description cho tank
 *
 * @param {number} tankID
 * @param {any} skillDescription
 */
export function setSkillDescription(tankID, skillDescription) {
	const existing = tankManifests.get(tankID);
	if (existing) {
		existing.skillDescription = skillDescription;
	} else {
		tankManifests.set(tankID, {
			skillDescription,
		});
	}
}

/**
 * Lấy tank manifest
 *
 * @param {number} tankID
 * @returns {{ stats: TankManifest, skills: SkillManifest, skillDescription: any }}
 * @throws {Error} Khi manifest bị thiếu
 */
export function getTankManifests(tankID) {
	const result = tankManifests.get(tankID);

	if (!result) throw new Error('Manifest does not exist');
	if (!result.stats || !result.skills || !result.skillDescription) {
		console.error('Manifest missing element', result);
		throw new Error('Manifest missing element');
	}

	return /** @type {{ stats: TankManifest, skills: SkillManifest, skillDescription: any }} */ (result);
}

/**
 * Kiểm tra tank manifest đã tồn tại chưa
 *
 * @param {number} tankID
 * @returns {boolean}
 */
export function hasTankManifests(tankID) {
	return tankManifests.has(tankID);
}

/**
 * @param {string} text
 */
function msg(text) {
	return `${LOG_PREFIX} ${text}`;
}

/** @type {SkillSPManifests?} */
export let skillSPManifests = null;

/**
 *
 * @param {SkillSPManifests} manifests
 */
export function setSkillSPManifest(manifests) {
	skillSPManifests = manifests;
}
