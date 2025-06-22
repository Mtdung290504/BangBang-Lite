export const angleFL = {
	/**
	 * Chuyển độ về radian
	 *
	 * @param {number} degree
	 * @returns {number}
	 */
	toRadian: (degree) => (degree * Math.PI) / 180,

	/**
	 * Chuyển radian về độ
	 *
	 * @param {number} radian
	 * @returns {number}
	 */
	toDegree: (radian) => (radian / Math.PI) * 180,

	/**
	 * Chuyển đổi một góc nằm ngoài [0, 360] về góc thuộc [0, 360]
	 *
	 * @param {number} angle
	 * @returns
	 */
	normalize: (angle) => ((angle % 360) + 360) % 360,
};
