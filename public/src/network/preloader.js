import { MAX_PARALLEL_REQUESTS } from '../configs/constants/game-system-configs.js';
import { loader, storage } from './assets_managers/index.js';

const LOG_PREFIX = '> [Net.preloader]';
const msg = (text) => `${LOG_PREFIX} ${text}`;
const { mapIDs, tankIDs } = await loadAllIDs();

export { mapIDs, tankIDs, preloadPhase1, preloadPhase2 };

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
		console.error(error);
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
		console.error(error);
		return false;
	}
}

/**
 * Tải toàn bộ asset cần thiết cho trận đấu
 *
 * - Tải background & scenes layer của map -> Cần Map ID
 * - Nếu player dùng skin khác, tải head & body sprite của tank đó -> Cần mảng từng player dùng tankID gì, skinID gì
 * - Tải tank stats manifest, tank skill manifest của từng tank
 * - Từ skill manifest của từng tank, đọc mọi hành vi có sprite (skill) và tải các sprite đó theo tankID với skinID
 *
 * - *Note for future:* Tải manifest của map (gồm 10 tọa độ hồi sinh, mảng polygons, lines, ...)
 * - *Note for future:* Tải icon skill cho tank sử dụng skin !== 0
 * - *Note for future:* Tải các object trên map !== 0
 * - *Note for future:* Có thể cần parse DSL để import động builder (Cái này khi nào hệ thống rất lớn rồi tính)
 *
 * @param {number} mapID
 * @param {import('models/Player.js').default[]} players
 */
function preloadPhase2(mapID, players) {
	// TODO: Preload parallel but < MAX_PARALLEL_REQUESTS parallel requests
	return true;
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
