/**
 * Tính số giây đã trôi qua từ 1 mốc đến hiện tại, làm tròn 2 chữ số.
 * @param {number} start
 */
export function elapsedSeconds(start) {
	return Math.round(((Date.now() - start) / 1000) * 100) / 100;
}

/**
 * Tạo hàm thêm prefix cố định vào chuỗi.
 * @param {string} prefix
 */
export function createPrefixer(prefix) {
	/**
	 * Thêm prefix đã định vào message.
	 * @param {string} message
	 * @param {'INFO' | 'WARN' | 'ERROR'} [type]
	 */
	return (message, type) => `${prefix}${type ? ` [${type}]` : ''} ${message}`;
}
