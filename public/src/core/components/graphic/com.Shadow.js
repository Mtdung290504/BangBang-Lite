/**
 * Component chỉ định hiệu ứng đổ bóng của entity.
 *
 * - angle: hướng của ánh sáng, đơn vị độ (0° = chiếu từ bên phải, bóng đổ sang trái).
 * - offsetX/offsetY: tỉ lệ lệch theo chiều ngang/dọc (mặc định: x=0.05, y=0.1).
 * - opacity: độ đậm của bóng (0–1).
 * - blur: mức độ mờ của bóng.
 */
export default class ShadowComponent {
	/**
	 * @param {object} options
	 * @param {number} [options.angle=45] - Hướng ánh sáng chiếu, đơn vị độ.
	 * @param {number} [options.offsetX=0.05] - Tỉ lệ offset ngang.
	 * @param {number} [options.offsetY=0.1] - Tỉ lệ offset dọc.
	 * @param {number} [options.opacity=0.45] - Độ đậm của bóng.
	 * @param {number} [options.blur=3] - Độ mờ (px).
	 */
	constructor({ angle = 45, offsetX = 0.05, offsetY = 0.1, opacity = 0.45, blur = 3 } = {}) {
		this.angle = angle;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.opacity = opacity;
		this.blur = blur;
	}
}
