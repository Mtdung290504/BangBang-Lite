/**
 * Convert degrees to radians
 *
 * @param {number} degreeValue
 * @returns {number}
 */
const degToRad = (degreeValue) => (degreeValue * Math.PI) / 180;

/**
 * Convert radians to degrees
 *
 * @param {number} radianValue
 * @returns {number}
 */
const radToDeg = (radianValue) => (radianValue / Math.PI) * 180;

/**
 * Convert an angle outside [0, 360] to an angle within [0, 360] ****Unit: degree***
 * (Chuyển đổi một góc nằm ngoài [0, 360] về góc thuộc [0, 360] ****Đơn vị: độ***)
 *
 * @param {number} degreeValue
 * @returns {number}
 */
const normalize = (degreeValue) => ((degreeValue % 360) + 360) % 360;

export { degToRad, radToDeg, normalize };
