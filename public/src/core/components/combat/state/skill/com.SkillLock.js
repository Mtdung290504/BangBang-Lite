export default class SkillLockComponent {
	/**
	 * Trạng thái khóa skill (Câm lặng, cấm dùng,...)
	 * @param {number} duration - Thời gian khóa (Đơn vị: ms)
	 */
	constructor(duration) {
		this.endTime = Date.now() + duration;
	}

	get expired() {
		return Date.now() >= this.endTime;
	}

	// Không có hàm unlock gì cả, system sẽ gỡ component này khi có lệnh
}
