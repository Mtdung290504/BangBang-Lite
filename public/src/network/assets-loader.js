import { PATHS } from '../configs/constants/paths.js';

const LOAD_SPRITE_LOG_PREFIX = '> [net.assets-loader.loadSprite]';

// Used to limit/manage the number of parallel requests
loadSprite['req-consumtion'] = 2;

export { loadSprite };

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

	const { manifestPath, spritePath } = PATHS.sprite(tankID, skinID, spriteKey);
	log(msg('Start loading'));
	const startTime = performance.now();

	// Parallel request using promises
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
		// Wait until all requests are completed
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
