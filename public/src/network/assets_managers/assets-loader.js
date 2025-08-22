import { ASSETS_PATH } from '../../configs/constants/paths.js';

const LOAD_SPRITE_LOG_PREFIX = '> [Net.assets-loader.loadSprite]';
const LOAD_MAP_LOG_PREFIX = '> [Net.assets-loader.loadMapAssets]';
const LOAD_MAP_ICON_LOG_PREFIX = '> [Net.assets-loader.loadMapIcon]';
const LOAD_TANK_MANIFESTS_LOG_PREFIX = '> [Net.assets-loader.loadTankManifests]';
const LOAD_SKILL_DESCRIPTION_LOG_PREFIX = '> [Net.assets-loader.loadSkillDescription]';

export { loadSprite, loadTankManifests, loadSkillDescription, loadMapAssets, loadMapIcon };

/**
 * Load sprite của tank, nhận về manifest và HTMLImageElement
 *
 * @param {number} tankID
 * @param {number} skinID
 * @param {string} spriteKey
 * @param {{
 * 		log?: (msg: string) => void
 * 		warn?: (msg: string) => void
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<{
 * 		sprite: HTMLImageElement,
 * 		manifest: import('.types/sprite-manifest').SpriteManifest | {
 * 			'frame-size': { width: number, height: number },
 * 			'frames-position': [{ x: 0, y: 0 }],
 * 		}
 * }>}
 *
 * @throws {Error} Khi tải ảnh hoặc manifest lỗi (trừ 404)
 */
async function loadSprite(tankID, skinID, spriteKey, logger = {}) {
	const { log = console.log, warn = console.warn, error = console.error } = logger;
	const spriteDisplay = `[${tankID}_${skinID}_${spriteKey}]`;
	const msg = (text) => `${LOAD_SPRITE_LOG_PREFIX} Sprite:${spriteDisplay} - ${text}`;

	const { manifestPath, spritePath } = ASSETS_PATH.sprite(tankID, spriteKey, skinID);
	log(msg('Start loading'));
	const startTime = performance.now();

	// Parallel requests
	const spritePromise = new Promise((resolve, reject) => {
		const img = new Image();
		img.src = spritePath;
		img.onload = () => resolve(img);
		img.onerror = (err) => reject(new Error(msg(`Error loading sprite image: ${err}`)));
	});
	const manifestPromise = fetch(manifestPath).then(async (res) => {
		if (res.status === 404) {
			log(msg('Manifest does not exist, using default value'));
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

		log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return { sprite, manifest };
	} catch (e) {
		error(e);
		throw e;
	}
}

/**
 * Load tank manifests (stats và skills)
 *
 * @param {number} tankID
 * @param {{
 * 		log?: (msg: string) => void
 * 		warn?: (msg: string) => void
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<{
 * 		stats: import('.DSL_regulations/tank-manifest').TankManifest
 * 		skills: import('.DSL_regulations/skills/skill-manifest').SkillManifest
 * }>}
 *
 * @throws {Error} Khi tải tank manifest lỗi
 */
async function loadTankManifests(tankID, logger = {}) {
	const { log = console.log, error = console.error } = logger;
	const msg = (text) => `${LOAD_TANK_MANIFESTS_LOG_PREFIX} Tank:${tankID} - ${text}`;

	const { manifestPath } = ASSETS_PATH.tankManifest(tankID);
	log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const module = await import(manifestPath);

		log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return {
			stats: module.stats,
			skills: module.skills,
		};
	} catch (e) {
		error(e);
		throw e;
	}
}

/**
 * Load skill description của tank
 *
 * @param {number} tankID
 * @param {{
 * 		log?: (msg: string) => void
 * 		warn?: (msg: string) => void
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<any>}
 *
 * @throws {Error} Khi tải skill description lỗi
 */
async function loadSkillDescription(tankID, logger = {}) {
	const { log = console.log, error = console.error } = logger;
	const msg = (text) => `${LOAD_SKILL_DESCRIPTION_LOG_PREFIX} Tank:${tankID} - ${text}`;

	const { skillDescriptionPath } = ASSETS_PATH.tankManifest(tankID);
	log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const res = await fetch(skillDescriptionPath);
		if (!res.ok) {
			throw new Error(msg(`Error loading skill description (HTTP:${res.status})`));
		}

		const skillDescription = await res.json();
		log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return skillDescription;
	} catch (e) {
		error(e);
		throw e;
	}
}

/**
 * Load toàn bộ asset của map gồm background layer và scene
 *
 * @param {number} mapID
 * @param {{
 * 		log?: (msg: string) => void
 * 		warn?: (msg: string) => void
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<{
 * 		background: HTMLImageElement,
 * 		scenes: HTMLImageElement | null
 * }>}.
 *
 * @throws {Error} Khi tải background hoặc scenes lỗi (trừ 404 scenes)
 */
async function loadMapAssets(mapID, logger = {}) {
	const { log = console.log, warn = console.warn, error = console.error } = logger;
	const msg = (text) => `${LOAD_MAP_LOG_PREFIX} Map:[${mapID}] - ${text}`;

	const { backgroundPath, scenesPath } = ASSETS_PATH.map(mapID);
	log(msg('Start loading'));
	const startTime = performance.now();

	// Hàm load ảnh kèm kiểm tra HTTP
	const loadImageWithHttpCheck = async (url, { allow404 = false, label }) => {
		// Check HTTP status first
		const res = await fetch(url, { method: 'HEAD' });
		if (res.status === 404 && allow404) {
			warn(msg(`${label} does not exist, returning null`));
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
	};

	try {
		const [scenes, background] = await Promise.all([
			loadImageWithHttpCheck(scenesPath, { allow404: true, label: 'scene' }),
			loadImageWithHttpCheck(backgroundPath, { allow404: false, label: 'background' }),
		]);

		log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return { background, scenes };
	} catch (e) {
		error(e);
		throw e;
	}
}

/**
 * Load icon của map
 *
 * @param {number} mapID
 * @param {{
 * 		log?: (msg: string) => void
 * 		warn?: (msg: string) => void
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<HTMLImageElement>}
 *
 * @throws {Error} Khi tải icon lỗi
 */
async function loadMapIcon(mapID, logger = {}) {
	const { log = console.log, error = console.error } = logger;
	const msg = (text) => `${LOAD_MAP_ICON_LOG_PREFIX} MapIcon:[${mapID}] - ${text}`;

	const { iconPath } = ASSETS_PATH.map(mapID);
	log(msg('Start loading'));
	const startTime = performance.now();

	try {
		const img = await new Promise((resolve, reject) => {
			const image = new Image();
			image.src = iconPath;
			image.onload = () => resolve(image);
			image.onerror = (err) => reject(new Error(msg(`Error loading map icon: ${err}`)));
		});

		log(msg(`Successfully loaded in ${(performance.now() - startTime).toFixed(2)}ms`));
		return img;
	} catch (e) {
		error(e);
		throw e;
	}
}
