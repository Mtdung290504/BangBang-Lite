import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Trả về danh sách thư mục con trong assets/images/maps (tính từ project root)
 * @returns {Promise<number[]>}
 */
export async function getMapIDs() {
	const mapsDir = join(process.cwd(), 'assets', 'images', 'maps');

	const entries = await readdir(mapsDir, { withFileTypes: true });
	return entries.filter((e) => e.isDirectory()).map((e) => parseInt(e.name));
}

/**
 * Trả về danh sách thư mục con trong assets/images/tanks (tính từ project root)
 * @returns {Promise<number[]>}
 */
export async function getTankIDs() {
	const mapsDir = join(process.cwd(), 'assets', 'images', 'tanks');

	const entries = await readdir(mapsDir, { withFileTypes: true });
	return entries.filter((e) => e.isDirectory()).map((e) => parseInt(e.name));
}
