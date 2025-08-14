import { PATHS } from '../configs/constants/paths.js';

const LOAD_SPRITE_LOG_PREFIX = '> [net.assets-loader.loadSprite]';
const LOAD_MAP_LOG_PREFIX = '> [net.assets-loader.loadMapAssets]';

// Used to limit/manage the number of parallel requests in the future
loadSprite['req-consumtion'] = 2;
loadMapAssets['req-consumtion'] = 2;

export { loadSprite, loadMapAssets };

/**
 * Load sprite của tank, nhận về manifest và HTMLImageElement
 *
 * @param {number} tankID
 * @param {number} skinID
 * @param {string} spriteKey
 * @param {{
 * 		log?: (msg: string) => void,
 * 		warn?: (msg: string) => void,
 * 		error?: (msg: string | Error) => void
 * }} [logger] - Logger (option - default dùng console)
 *
 * @returns {Promise<{
 * 		sprite: HTMLImageElement,
 * 		manifest: import('.types/sprite-manifest.js').SpriteManifest | null
 * }>}
 *
 * @throws {Error} Khi tải ảnh hoặc manifest lỗi (trừ 404)
 */
async function loadSprite(tankID, skinID, spriteKey, logger = {}) {
	const { log = console.log, warn = console.warn, error = console.error } = logger;
	const spriteDisplay = `[${tankID}][${skinID}][${spriteKey}]`;
	const msg = (text) => `${LOAD_SPRITE_LOG_PREFIX} Sprite:${spriteDisplay} - ${text}`;

	const { manifestPath, spritePath } = PATHS.sprite(tankID, spriteKey, skinID);
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
			warn(msg('Manifest does not exist, using default value'));
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
 * Load toàn bộ asset của map gồm background layer và scene
 *
 * @param {number} mapID
 * @param {{
 * 		log?: (msg: string) => void,
 * 		warn?: (msg: string) => void,
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
	const msg = (text) => `${LOAD_MAP_LOG_PREFIX} Map:${mapID} - ${text}`;

	const { backgroundPath, scenesPath } = PATHS.map(mapID);
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
