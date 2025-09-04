/**
 * Tính số giây đã trôi qua từ 1 mốc đến hiện tại, làm tròn 2 chữ số.
 * @param {number} start
 */
export function elapsedSeconds(start) {
	return Math.round(((Date.now() - start) / 1000) * 100) / 100;
}
