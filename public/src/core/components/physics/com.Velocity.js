export default class VelocityComponent {
	/**
	 * Note: Khác với Speed component, component này chỉ chứa delta positions để cộng vào position khi update
	 *
	 * @param {number} [dx]
	 * @param {number} [dy]
	 * @param {number} [dz] - Xử lý trong tương lai, hiện tại chưa đụng đến
	 */
	constructor(dx, dy, dz) {
		this.dx = dx ?? 0;
		this.dy = dy ?? 0;
		this.dz = dz ?? 0;
	}
}
