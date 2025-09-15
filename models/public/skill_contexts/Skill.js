/**
 * - Class quản lý skill thông thường, khi dùng skill bắt đầu tính thời gian CD, CD xong mới dùng lại được.
 * - Sử dụng:
 *      + Phải dùng `getRemainingCooldown()` trong gameloop hoặc trong một loop nào đó để đảm bảo trạng thái hồi chiêu được cập nhật liên tục
 *      + Sau khi gọi activate, cần phải gọi `startCooldown()` để bắt đầu tính thời gian hồi chiêu
 *      + Trong trường hợp skill dùng xong mới CD, gọi `lock()` để khóa skill, gọi `unlock()` để mở khóa skill hoặc gọi `isLocked()` để kiểm tra và mở khóa skill một cách tự động
 *      + Gọi `isLocked()` để trả về tình trạng block của skill, dùng khi hiển thị ra giao diện. Nếu dùng `isLocked()` trong loop, không cần thiết gọi `unlock()`
 * @class
 */
export default class Skill {
	/**
	 * @param {string} name - Tên của kỹ năng.
	 * @param {number} cooldown - Thời gian hồi chiêu của kỹ năng (tính bằng giây).
	 */
	constructor(name, cooldown) {
		/**Tên skill */
		this.name = name;
		/** Thời gian CD (tính bằng giây) */
		this.cooldown = cooldown * 1000;

		/**
		 * Thời gian lần cuối sử dụng skill
		 */
		this.lastUsedTime = null;

		/** Thời gian khóa skill, ban đầu khi chưa có gì là 0 */
		this.lockDuration = 0;
		/** Thời điểm bắt đầu khóa skill, ban đầu khi chưa có gì là null */
		this.lockStartTime = null;
	}

	/**
	 * - Kiểm tra skill có đang trong trạng thái khóa không.
	 * - Trả về giá trị để cập nhật giao diện
	 * @returns {boolean} Trả về `true` nếu skill đang bị khóa, `false` trong trường hợp ngược lại
	 */
	isLocked() {
		if (this.lockDuration > 0 && this.lockStartTime) {
			const elapsed = Date.now() - this.lockStartTime;
			if (elapsed >= this.lockDuration) {
				this.unlock();
				return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * - Khóa skill, trong một khoảng thời gian không thể sử dụng
	 * - Sử dụng hàm này trong các skill đòi hỏi dùng xong mới CD, tạm thời khóa skill tránh việc spam trước khi bật hồi chiêu
	 * @param {number} duration - Thời gian khóa tính bằng giây
	 */
	lock(duration) {
		this.lockDuration = duration * 1000;
		this.lockStartTime = Date.now();
	}

	/**
	 * - Mở khóa skill
	 */
	unlock() {
		this.lockDuration = 0;
		this.lockStartTime = null;
	}

	/**
	 * - Kiểm tra skill có đang trong trạng thái hồi chiêu không.
	 * @returns {boolean} Trả về `true` nếu skill đang hồi chiêu, `false` nếu không.
	 */
	isCoolingDown() {
		return this.getRemainingCooldown() > 0;
	}

	/**
	 * Kích hoạt skill
	 */
	activate() {
		if (this.isCoolingDown() || this.isLocked()) {
			return;
		}

		// Gọi skill
		this.onActivateCallback();
	}

	/**
	 * @abstract
	 * - Hàm này được gọi khi hàm `activate` được gọi
	 * - Ghi đè hàm này lên lớp con kế thừa lớp skill để triển khai các tính năng của skill
	 */
	onActivateCallback() {
		console.log(`Activate skill ${this.name}`);
	}

	/**
	 * Bắt đầu tính thời gian hồi chiêu
	 */
	startCooldown() {
		this.lastUsedTime = Date.now();
	}

	/**
	 * Kiểm tra thời gian hồi chiêu còn lại của kỹ năng.
	 * @returns {number} Thời gian hồi chiêu còn lại (tính bằng giây, chính xác đến 0.01 giây).
	 */
	getRemainingCooldown() {
		if (!this.lastUsedTime) {
			return 0;
		}
		/** Thời gian đã trôi qua kể từ lần cuối dùng skill (đơn vị: mili giây) */
		const timePassed = Date.now() - this.lastUsedTime;
		/** Thời gian hồi chiêu còn lại (đơn vị: mili giây) */
		const remaining = (this.cooldown - timePassed) / 1000;

		if (remaining <= 0) {
			// Nếu thời gian hồi chiêu còn lại <= 0, kết thúc hồi chiêu ngay lập tức
			this.endCooldown();
			return 0;
		}

		return parseFloat(remaining.toFixed(2));
	}

	/**
	 * Giảm thời gian hồi chiêu của kỹ năng theo đơn vị giây.
	 * @param {number} amount - Số giây cần giảm.
	 */
	reduceCooldown(amount) {
		if (this.isCoolingDown()) {
			// Chỉ kích hoạt khi đang trong trạng thái cooldown
			/** Thời gian hồi chiêu còn lại (đơn vị: mili giây) */
			const remainingCooldown = this.getRemainingCooldown() * 1000;
			/** Khoảng thời gian cần giảm (đơn vị: mili giây) - Tối đa giảm bằng thời gian hồi chiêu còn lại */
			const reduceAmount = Math.min(amount * 1000, remainingCooldown);
			// Cập nhật thời gian lần cuối sử dụng, lùi nó về quá khứ để giảm thời gian hồi chiêu
			this.lastUsedTime -= reduceAmount;

			if (this.getRemainingCooldown() <= 0) {
				// Nếu thời gian hồi chiêu còn lại <= 0, kết thúc hồi chiêu ngay lập tức
				this.endCooldown();
			}
		}
	}

	/**
	 * Giảm thời gian hồi chiêu của kỹ năng theo đơn vị phần trăm.
	 * @param {number} percentage - Phần trăm cần giảm.
	 */
	reduceCooldownPercentage(percentage) {
		if (this.isCoolingDown()) {
			// Chỉ kích hoạt khi đang trong trạng thái cooldown
			const amountToReduce = (this.cooldown * percentage) / 100;
			this.reduceCooldown(amountToReduce); // Chuyển đổi về giây và gọi hàm giảm theo đơn vị giây
		}
	}

	/**
	 * Kết thúc hồi chiêu ngay lập tức.
	 */
	endCooldown() {
		this.lastUsedTime = null;
	}
}
