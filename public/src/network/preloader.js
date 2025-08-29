import { MAX_PARALLEL_REQUESTS } from '../../configs/constants/game-system-configs.js';
import { loader, storage } from './assets_managers/index.js';

const LOG_PREFIX = '> [Net.preloader]';

export { preloadPhase1, preloadPhase2 };

/**
 * @returns {Promise<{ mapIDs: number[], tankIDs: number[] }>}
 */
async function loadAllIDs() {
	try {
		const [mapIDs, tankIDs] = await Promise.all(
			['map', 'tank'].map((endpoint) =>
				fetch(`/ids/${endpoint}`).then((res) => {
					if (!res.ok) throw new Error(msg(`HTTP ${res.status} when get IDs. Endpoint:[/ids/${endpoint}]`));
					return res.json();
				})
			)
		);

		console.log(msg('Using map IDs:'), mapIDs);
		console.log(msg('Using tank IDs:'), tankIDs);

		return { mapIDs, tankIDs };
	} catch (error) {
		console.error(msg('Error:'), error);
		alert('Lỗi khi tải metadata của tài nguyên, cần tải lại trang hoặc thử vào lại sau!');
		return { mapIDs: [], tankIDs: [] };
	}
}

/**
 * Load all required asset for lobby (sảnh chờ)
 *
 * - Load full tank model (head & body of skin 0)
 * - Load full map icon
 *
 * - *Note for future:* Load metadata (map/tank name)
 * - *Note for future:* All icon skill, skill descriptions
 *
 * @returns {Promise<boolean>}
 */
async function preloadPhase1() {
	const { mapIDs, tankIDs } = await loadAllIDs();
	storage.setAssetIDs(mapIDs, tankIDs);

	try {
		const tasks = [];

		// Load tank sprites: head + body (skin 0)
		for (const tankID of tankIDs) {
			tasks.push(async () => {
				const [head, body] = await Promise.all([
					loader.loadSprite(tankID, 0, 'head'),
					loader.loadSprite(tankID, 0, 'body'),
				]);

				storage.setSprite(tankID, 0, 'head', head);
				storage.setSprite(tankID, 0, 'body', body);
			});
		}

		// Load map icons
		for (const mapID of mapIDs) {
			tasks.push(async () => {
				const img = await loader.loadMapIcon(mapID);
				storage.setMapIcon(mapID, img);
			});
		}

		await runWithConcurrencyLimit(tasks, MAX_PARALLEL_REQUESTS);

		console.log(msg('Preload Phase 1 completed successfully'));
		return true;
	} catch (error) {
		console.error(msg('Preload Phase 1 failed:'), error);
		return false;
	}
}

/**
 * Tải toàn bộ asset cần thiết cho trận đấu
 *
 * - Tải background & scenes layer của map -> Cần Map ID
 * - Nếu player dùng skin khác, tải head & body sprite của tank đó -> Cần mảng từng player dùng tankID gì, skinID gì
 * - Tải toàn bộ normal-attack sprite của tank
 * - Tải tank stats manifest, tank skill manifest của từng tank
 * - Từ skill manifest của từng tank, duyệt sâu hết `skills` và đọc mọi key `sprite` và tải các sprite đó theo tankID với skinID
 *
 * - *Note for future:* Tải manifest của map (gồm 10 tọa độ hồi sinh, mảng polygons, lines, ...)
 * - *Note for future:* Tải icon skill cho tank sử dụng skin !== 0
 * - *Note for future:* Tải các object trên map !== 0
 * - *Note for future:* Có thể cần parse DSL để import động builder (Cái này khi nào hệ thống rất lớn rồi tính)
 *
 * @param {number} mapID
 * @param {import('models/Player.js').default[]} players
 */
async function preloadPhase2(mapID, players) {
	try {
		const tasks = [];

		// 1. Load map assets (background & scenes) & map manifest
		if (!storage.getMapAssets(mapID)) {
			tasks.push(async () => {
				const mapAssets = await loader.loadMapAssets(mapID);
				storage.setMapAssets(mapID, mapAssets);
			});
		}
		if (!storage.getMapManifest(mapID)) {
			tasks.push(async () => {
				const mapManifest = await loader.loadMapManifests(mapID);
				storage.setMapManifest(mapID, mapManifest);
			});
		}

		// 2. Collect unique tank configurations from all players
		const tankConfigs = new Map(); // Map<tankID, Set<skinID>>
		for (const player of players) {
			const tankID = player.using.tankID;
			const skinID = player.using.skinID;

			if (!tankConfigs.has(tankID)) {
				tankConfigs.set(tankID, new Set());
			}
			tankConfigs.get(tankID).add(skinID);
		}

		// 3. Load tank manifests and skill descriptions for each unique tank
		for (const tankID of tankConfigs.keys()) {
			// Load tank manifests if not already loaded
			if (!storage.hasTankManifests(tankID)) {
				tasks.push(async () => {
					const manifests = await loader.loadTankManifests(tankID);
					storage.setTankManifests(tankID, manifests);
				});

				tasks.push(async () => {
					const skillDescription = await loader.loadSkillDescription(tankID);
					storage.setSkillDescription(tankID, skillDescription);
				});
			}
		}

		// 4. Load tank sprites (head & body) for each tank-skin combination and all normal attack sprite
		for (const [tankID, skinIDs] of tankConfigs) {
			for (const skinID of skinIDs) {
				// Load normal attack sprite for all skins (not loaded in phase 1)
				if (!storage.hasSprite(tankID, skinID, 'normal-attack')) {
					tasks.push(async () => {
						const spriteData = await loader.loadSprite(tankID, skinID, 'normal-attack');
						storage.setSprite(tankID, skinID, 'normal-attack', spriteData);
					});
				}

				// Skip if already loaded in phase 1 (skin 0)
				if (skinID === 0) continue;

				// Load head and body sprites for non-default skins
				if (!storage.hasSprite(tankID, skinID, 'head')) {
					tasks.push(async () => {
						const head = await loader.loadSprite(tankID, skinID, 'head');
						storage.setSprite(tankID, skinID, 'head', head);
					});
				}

				if (!storage.hasSprite(tankID, skinID, 'body')) {
					tasks.push(async () => {
						const body = await loader.loadSprite(tankID, skinID, 'body');
						storage.setSprite(tankID, skinID, 'body', body);
					});
				}
			}
		}

		// 5. Load skill sprites based on skill manifests
		// Wait for manifests to be loaded first
		await runWithConcurrencyLimit(
			tasks.filter(
				(task) =>
					task.toString().includes('loadTankManifests') || task.toString().includes('loadSkillDescription')
			),
			MAX_PARALLEL_REQUESTS
		);

		// Now load skill sprites
		const skillSpriteTasks = [];
		for (const [tankID, skinIDs] of tankConfigs) {
			const { skills } = storage.getTankManifests(tankID);

			/**
			 * Deep traverse skills object to find all sprite keys
			 *
			 * @param {any} obj
			 * @param {Set<string>} collected
			 */
			const collectSpriteKeys = (obj, collected = new Set()) => {
				if (typeof obj !== 'object' || obj === null) return collected;

				for (const [key, value] of Object.entries(obj)) {
					if (key === 'sprite-key' && typeof value === 'string') {
						collected.add(value);
					} else if (typeof value === 'object') {
						collectSpriteKeys(value, collected);
					}
				}
				return collected;
			};

			const spriteKeys = collectSpriteKeys(skills);

			// Load each sprite for each skin of this tank
			for (const skinID of skinIDs) {
				for (const spriteKey of spriteKeys) {
					if (!storage.hasSprite(tankID, skinID, spriteKey)) {
						skillSpriteTasks.push(async () => {
							const spriteData = await loader.loadSprite(tankID, skinID, spriteKey);
							storage.setSprite(tankID, skinID, spriteKey, spriteData);
						});
					}
				}
			}
		}

		// Execute remaining tasks (map assets, tank sprites) and skill sprite tasks
		const remainingTasks = tasks.filter(
			(task) =>
				!task.toString().includes('loadTankManifests') && !task.toString().includes('loadSkillDescription')
		);

		await runWithConcurrencyLimit([...remainingTasks, ...skillSpriteTasks], MAX_PARALLEL_REQUESTS);

		console.log(msg('Preload Phase 2 completed successfully'));
		return true;
	} catch (error) {
		console.error(msg('Preload Phase 2 failed:'), error);
		return false;
	}
}

/**
 * Helper: Chạy một danh sách async tasks với số lượng song song tối đa
 *
 * @template T
 *
 * @param {(() => Promise<T>)[]} tasks - danh sách hàm async không có tham số
 * @param {number} limit - số tác vụ tối đa chạy song song
 *
 * @returns {Promise<T[]>}
 */
async function runWithConcurrencyLimit(tasks, limit) {
	/**@type {any[]} */
	const results = [];
	let index = 0;

	return new Promise((resolve, reject) => {
		let active = 0;

		const runNext = () => {
			if (index >= tasks.length && active === 0) {
				resolve(results);
				return;
			}
			while (active < limit && index < tasks.length) {
				const currentIndex = index++;
				active++;
				tasks[currentIndex]()
					.then((res) => {
						results[currentIndex] = res;
						active--;
						runNext();
					})
					.catch((err) => {
						reject(err);
					});
			}
		};

		runNext();
	});
}

/**
 * @param {string} text
 */
function msg(text) {
	return `${LOG_PREFIX} ${text}`;
}
