/**
 * Convert degrees to radians
 *
 * @param {number} degreeValue
 * @returns {number}
 */
export const degToRad = (degreeValue) => (degreeValue * Math.PI) / 180;

/**
 * Convert radians to degrees
 *
 * @param {number} radianValue
 * @returns {number}
 */
export const radToDeg = (radianValue) => (radianValue / Math.PI) * 180;

/**
 * Convert an angle outside [0, 360] to an angle within [0, 360] ****Unit: degree***
 * (Chuyển đổi một góc nằm ngoài [0, 360] về góc thuộc [0, 360] ****Đơn vị: độ***)
 *
 * @param {number} degreeValue
 * @returns {number}
 */
export const normalize = (degreeValue) => ((degreeValue % 360) + 360) % 360;
