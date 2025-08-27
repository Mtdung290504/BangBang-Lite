export default class VelocityComponent {
	/**
	 * Note: Khác với Speed component, component này chỉ chứa delta positions để cộng vào position khi update
	 *
	 * @param {number} [x]
	 * @param {number} [y]
	 * @param {number} [z] - Xử lý trong tương lai, hiện tại chưa đụng đến
	 */
	constructor(x, y, z) {
		this.x = x ?? 0;
		this.y = y ?? 0;
		this.z = z ?? 0;
	}
}
