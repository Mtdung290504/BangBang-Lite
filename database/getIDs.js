import { readdir } from 'fs/promises';
import { join } from 'path';
import { MAP_BASE_PATH, SPRITE_BASE_PATH } from '../public/configs/constants/paths.js';
import { memoize } from '../utils/memoize.js';

const getMapIDs = memoize(rawGetMapIDs, { ttl: 1000 * 60 * 60 });
const getTankIDs = memoize(rawGetTankIDs, { ttl: 1000 * 60 * 60 });

export { getMapIDs, getTankIDs };

/**
 * - Trả về danh sách thư mục con trong assets/images/maps (tính từ project root)
 * - Mỗi thư mục được đặt tên là ID của 1 map
 *
 * @returns {Promise<number[]>}
 */
async function rawGetMapIDs() {
	const mapsDir = join(process.cwd(), MAP_BASE_PATH);
	const entries = await readdir(mapsDir, { withFileTypes: true });

	return entries.filter((e) => e.isDirectory()).map((e) => parseInt(e.name));
}

/**
 * - Trả về danh sách thư mục con trong SPRITE_BASE_PATH dưới dạng mảng các ID (number)
 * - Mỗi thư mục được đặt tên là ID của 1 tank
 *
 * @returns {Promise<number[]>}
 */
async function rawGetTankIDs() {
	const mapsDir = join(process.cwd(), SPRITE_BASE_PATH);
	const entries = await readdir(mapsDir, { withFileTypes: true });

	return entries.filter((e) => e.isDirectory()).map((e) => parseInt(e.name));
}
