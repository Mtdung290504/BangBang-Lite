/**
 * Emitter gom nhiều event thành batch để gửi một lần
 */
export class BufferedEmitter {
	/**
	 * @param {{ emit: (event: string, ...data: any[]) => void }} emitter
	 * @param {() => number} getFrameRate - Hàm trả về FPS (Dùng vì FPS game là giá trị động)
	 * @param {number} [ratio=0.5] - tỉ lệ frameTime để flush (0.5 = nửa frame, 0.75 = 3/4 frame. Mặc định: 0.5)
	 */
	constructor(emitter, getFrameRate, ratio = 0.5) {
		this.target = emitter;
		this.getFrameRate = getFrameRate;
		this.ratio = ratio;

		/** @type {number | NodeJS.Timeout | null} */
		this.timeoutId = null;

		/** @type {any[]} */
		this.queue = [];
	}

	/**
	 * Tính thời gian delay động dựa trên FPS hiện tại
	 * Note: fallback về 60 FPS khi `getFrameRate` ra kết quả < 0
	 */
	get delay() {
		const fps = this.getFrameRate();
		if (fps <= 0) return 1000 / 60; // Fallback 60fps
		return (1000 / fps) * this.ratio;
	}

	/**
	 * Thay vì emit ngay, gom lại
	 *
	 * @param {string} event
	 * @param {...any} data
	 */
	emit(event, ...data) {
		this.queue.push([event, ...data]);
		if (this.timeoutId === null) {
			this.timeoutId = setTimeout(() => this.flush(), this.delay);
		}
	}

	/**
	 * Gửi một lần tất cả event đã gom
	 */
	flush() {
		this.timeoutId = null;
		if (this.queue.length > 0) {
			this.target.emit('batch', this.queue);
			this.queue = [];
		}
	}

	/**
	 * Cleanup
	 */
	destroy() {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		if (this.queue.length > 0) {
			this.flush();
		}
	}
}
