import { SPRITE_MANIFEST_404_KEY } from '../../../configs/constants/game-system-configs.js';
import { ASSETS_PATH, SKILL_SP_MANIFEST_PATH } from '../../../configs/constants/paths.js';

const LOAD_SPRITE_LOG_PREFIX = '> [net.assets-loader.loadSprite]';
const LOAD_MAP_LOG_PREFIX = '> [net.assets-loader.loadMapAssets]';
const LOAD_MAP_ICON_LOG_PREFIX = '> [net.assets-loader.loadMapIcon]';
const LOAD_TANK_MANIFESTS_LOG_PREFIX = '> [net.assets-loader.loadTankManifests]';
const LOAD_MAP_MANIFESTS_LOG_PREFIX = '> [net.assets-loader.loadMapManifests]';
const LOAD_SKILL_DESCRIPTION_LOG_PREFIX = '> [net.assets-loader.loadSkillDescription]';
const LOAD_SKILL_SP_MANIFEST_LOG_PREFIX = '> [net.assets-loader.loadSkillSPManifests]';

export { loadSprite, loadTankManifests, loadSkillDescription, loadMapAssets, loadMapManifests, loadMapIcon };

/**
 * @typedef {import('.types-system/src/graphic/graphics').SpriteManifest} _SpriteManifest
 * @typedef {import('.types-system/dsl/tank-manifest').TankManifest} _TankManifest
 * @typedef {import('.types-system/dsl/skill-manifest').SkillManifest} _SkillManifest
 */

/**
 * Load sprite của tank, nhận về manifest và HTMLImageElement
 * - Note: Nếu không có sprite manifest, giá trị frame-size sẽ lấy theo kích thước ảnh gốc
 *
 * @param {number} tankID
 * @param {number} skinID
 * @param {string} spriteKey
 *
 * @returns {Promise<{
 * 		sprite: HTMLImageElement,
 * 		manifest: _SpriteManifest | {
 * 			'frame-size': { width: number, height: number },
 * 			'frames-position': [{ x: 0, y: 0 }],
 * 		}
 * }>}
 *
 * @throws {Error} Khi tải ảnh hoặc manifest lỗi (trừ 404)
 */
async function loadSprite(tankID, skinID, spriteKey, logger = {}) {
	const spriteFullKey = `${tankID}_${skinID}_${spriteKey}`;
	const msg = (text = '...') => `${LOAD_SPRITE_LOG_PREFIX} Sprite:[${spriteFullKey}] - ${text}`;

	const { manifestPath, spritePath } = ASSETS_PATH.sprite(tankID, spriteKey, skinID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	// Parallel requests
	const spritePromise = new Promise((resolve, reject) => {
		const img = new Image();
		img.src = spritePath;
		img.onload = () => resolve(img);
		img.onerror = (err) => reject(new Error(msg(`Error loading sprite image: ${err}`)));
	});
	const manifestPromise = checkManifest404(spriteFullKey)
		? Promise.resolve().then(() => {
				console.log(msg('Detect known manifest 404, using default value'));
				return null;
		  })
		: fetch(manifestPath).then(async (res) => {
				if (res.status === 404) {
					console.log(msg('Manifest does not exist, using default value'));
					cacheManifest404(spriteFullKey);
					return null;
				}
				if (!res.ok) {
					throw new Error(msg(`Error loading manifest (HTTP:${res.status})`));
				}
				return res.json();
		  });

	try {
		const [rawManifest, sprite] = await Promise.all([manifestPromise, spritePromise]);
		const manifest = rawManifest ?? {
			'frame-size': { width: sprite.width, height: sprite.height },
			'frames-position': [{ x: 0, y: 0 }],
		};

		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return { sprite, manifest };
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}

/**
 * Helper hỗ trợ `loadSprite` tránh gửi request thừa khi sprite 404
 * @param {string} spriteFullKey
 */
function cacheManifest404(spriteFullKey) {
	/**@type {string[]} */
	const cachedKeys = JSON.parse(localStorage.getItem(SPRITE_MANIFEST_404_KEY) || '[]');
	cachedKeys.push(spriteFullKey);
	localStorage.setItem(SPRITE_MANIFEST_404_KEY, JSON.stringify(cachedKeys));
}

/**
 * Helper hỗ trợ `loadSprite` tránh gửi request thừa khi sprite 404
 * @param {string} spriteFullKey
 */
function checkManifest404(spriteFullKey) {
	/**@type {string[]} */
	const cachedKeys = JSON.parse(localStorage.getItem(SPRITE_MANIFEST_404_KEY) || '[]');
	return cachedKeys.includes(spriteFullKey);
}

/**
 * Load tank manifests (stats và skills)
 *
 * @param {number} tankID
 * @returns {Promise<{ stats: _TankManifest, skills: _SkillManifest }>}
 * @throws {Error} Khi tải tank manifest lỗi
 */
async function loadTankManifests(tankID) {
	const msg = (text = '...') => `${LOAD_TANK_MANIFESTS_LOG_PREFIX} Tank:${tankID} - ${text}`;

	const { manifestPath } = ASSETS_PATH.tankManifest(tankID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const module = await import(manifestPath);
		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return { stats: module.stats, skills: module.skills };
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}

/**
 * Load skill description của tank
 *
 * @param {number} tankID
 * @returns {Promise<any>}
 * @throws {Error} Khi tải skill description lỗi
 */
async function loadSkillDescription(tankID) {
	const msg = (text = '...') => `${LOAD_SKILL_DESCRIPTION_LOG_PREFIX} Tank:${tankID} - ${text}`;

	const { skillDescriptionPath } = ASSETS_PATH.tankManifest(tankID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const res = await fetch(skillDescriptionPath);
		if (!res.ok) {
			throw new Error(msg(`Error loading skill description (HTTP:${res.status})`));
		}

		const skillDescription = await res.json();
		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return skillDescription;
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}

/**
 * Load toàn bộ asset của map gồm background layer và scene
 *
 * @param {number} mapID
 * @returns {Promise<{
 * 		background: HTMLImageElement,
 * 		scenes: HTMLImageElement | null
 * }>}
 * @throws {Error} Khi tải background hoặc scenes lỗi (trừ 404 scenes)
 */
async function loadMapAssets(mapID) {
	const msg = (text = '...') => `${LOAD_MAP_LOG_PREFIX} Map:[${mapID}] - ${text}`;

	const { backgroundPath, scenesPath } = ASSETS_PATH.map(mapID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const [scenes, background] = await Promise.all([
			loadImageWithHttpCheck(scenesPath, { allow404: true, label: 'scene' }),
			loadImageWithHttpCheck(backgroundPath, { allow404: false, label: 'background' }),
		]);

		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return { background, scenes };
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}

	/**
	 * Load image and check HTTP status for allow 404 response or not
	 *
	 * @param {string} url
	 * @param {Object} configs
	 * @param {boolean} configs.allow404
	 * @param {string} configs.label
	 */
	async function loadImageWithHttpCheck(url, { allow404 = false, label }) {
		// Check HTTP status first
		const res = await fetch(url, { method: 'HEAD' });
		if (res.status === 404 && allow404) {
			console.warn(msg(`${label} does not exist, returning null`));
			return null;
		}
		if (!res.ok) {
			throw new Error(msg(`Error loading ${label} (HTTP:${res.status})`));
		}

		// Nếu pass check thì mới tạo <img>
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = url;
			img.onload = () => resolve(img);
			img.onerror = (err) => reject(new Error(msg(`Error loading ${label} image: ${err}`)));
		});
	}
}

/**
 * Load map manifests (size và một số thứ khác trong tương lai)
 *
 * @param {number} mapID
 * @returns {Promise<import('.types-system/dsl/map-manifest.js').MapManifest>}
 * @throws {Error} Khi tải tank manifest lỗi
 */
async function loadMapManifests(mapID) {
	const msg = (text = '...') => `${LOAD_MAP_MANIFESTS_LOG_PREFIX} Map:${mapID} - ${text}`;

	const { manifestPath } = ASSETS_PATH.map(mapID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const module = await import(manifestPath);

		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return module['default'];
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}

/**
 * Load icon của map
 *
 * @param {number} mapID
 * @returns {Promise<HTMLImageElement>}
 * @throws {Error} Khi tải icon lỗi
 */
async function loadMapIcon(mapID) {
	const msg = (text = '...') => `${LOAD_MAP_ICON_LOG_PREFIX} MapIcon:[${mapID}] - ${text}`;

	const { iconPath } = ASSETS_PATH.map(mapID);
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const img = await new Promise((resolve, reject) => {
			const image = new Image();
			image.src = iconPath;
			image.onload = () => resolve(image);
			image.onerror = (err) => reject(new Error(msg(`Error loading map icon: ${err}`)));
		});

		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return img;
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}

/**
 * Load skill sp manifests
 * @returns {Promise<import('assets/battle_manifests/skill_sp_manifests.js')['default']>}
 * @throws {Error} Khi tải skill sp manifest lỗi
 */
export async function loadSkillSPManifests() {
	const msg = (text = '...') => `${LOAD_SKILL_SP_MANIFEST_LOG_PREFIX} ${text}`;
	console.log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const module = await import(SKILL_SP_MANIFEST_PATH);
		console.log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return module['default'];
	} catch (e) {
		console.error(msg('Error:'), e);
		throw e;
	}
}
