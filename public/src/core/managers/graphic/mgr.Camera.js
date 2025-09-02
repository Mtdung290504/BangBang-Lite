export default class CameraManager {
	/**
	 * @param {HTMLCanvasElement} canvas - Canvas vẽ đồ họa
	 */
	constructor(canvas) {
		/** Tạm hiểu là tọa độ x góc trái trên của camera */
		this.viewportX = 0;
		/** Tạm hiểu là tọa độ y góc trái trên của camera */
		this.viewportY = 0;

		/** Tọa độ của mục tiêu cần theo dõi */
		this.targetPosition = { x: 0, y: 0 };
		this.canvas = canvas;

		/** Chiều rộng của bản đồ game */
		this.mapWidth = 0;
		/** Chiều cao của bản đồ game */
		this.mapHeight = 0;

		/** Chiều rộng tầm nhìn camera */
		this.viewportWidth = canvas ? canvas.width : 0;
		/** Chiều cao tầm nhìn camera */
		this.viewportHeight = canvas ? canvas.height : 0;

		/**
		 * Tỉ lệ dead zone theo chiều rộng/chiều cao viewport.
		 * @private
		 */
		this._deadZoneRatio = 1 / 6;
	}

	/** Camera viewport width */
	get width() {
		return this.viewportWidth;
	}

	/** Camera viewport height */
	get height() {
		return this.viewportHeight;
	}

	/** Khoảng giá trị mà sự thay đổi tọa độ x của target chưa làm camera dịch chuyển */
	get deadZoneWidth() {
		return this.width * this._deadZoneRatio;
	}

	/** Khoảng giá trị mà sự thay đổi tọa độ y của target chưa làm camera dịch chuyển */
	get deadZoneHeight() {
		return this.height * this._deadZoneRatio;
	}

	/**
	 * Đặt lại kích thước bản đồ game
	 *
	 * @param {number} mapWidth
	 * @param {number} mapHeight}
	 */
	setMapSize(mapWidth, mapHeight) {
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
	}

	/**
	 * Đặt kích thước viewport của camera (tách biệt với canvas)
	 *
	 * @param {number} width
	 * @param {number} height
	 */
	setSize(width, height) {
		this.viewportWidth = width;
		this.viewportHeight = height;

		// Bản cũ khi setSize chuyển dead zone về width/6, height/6
		this._deadZoneRatio = 1 / 6;
	}

	/**
	 * Camera sẽ dịch chuyển theo `target` được truyền vào
	 * @param {{ x: number, y: number }} target
	 */
	follow(target) {
		this.targetPosition = target;
	}

	/**
	 * Updates the camera position based on the current target.
	 */
	update() {
		let { x: targetX, y: targetY } = this.targetPosition;

		// Tính biên dead zone
		const leftBound = this.viewportX + (this.width - this.deadZoneWidth) / 2;
		const rightBound = this.viewportX + (this.width + this.deadZoneWidth) / 2;
		const topBound = this.viewportY + (this.height - this.deadZoneHeight) / 2;
		const bottomBound = this.viewportY + (this.height + this.deadZoneHeight) / 2;

		// Chỉ dịch chuyển viewport khi target vượt biên dead zone
		if (targetX < leftBound) {
			this.viewportX = targetX - (this.width - this.deadZoneWidth) / 2;
		} else if (targetX > rightBound) {
			this.viewportX = targetX - (this.width + this.deadZoneWidth) / 2;
		}

		if (targetY < topBound) {
			this.viewportY = targetY - (this.height - this.deadZoneHeight) / 2;
		} else if (targetY > bottomBound) {
			this.viewportY = targetY - (this.height + this.deadZoneHeight) / 2;
		}

		this._clamp();
	}

	/**
	 * Convert từ screen coords sang world coords
	 *
	 * @param {number} screenX
	 * @param {number} screenY
	 */
	screenToWorld(screenX, screenY) {
		const { left, top } = this.canvas.getBoundingClientRect();
		return {
			x: screenX - left + this.viewportX,
			y: screenY - top + this.viewportY,
		};
	}

	/**
	 * Convert từ world coords sang screen coords
	 *
	 * @param {number} worldX
	 * @param {number} worldY
	 */
	worldToScreen(worldX, worldY) {
		const { left, top } = this.canvas.getBoundingClientRect();
		return {
			x: worldX - this.viewportX + left,
			y: worldY - this.viewportY + top,
		};
	}

	/**
	 * Lấy về tọa đô cần render
	 */
	getTranslate() {
		return { x: -this.viewportX, y: -this.viewportY };
	}

	/**
	 * Áp transform camera trực tiếp lên context (giữ tương thích bản cũ)
	 * @param {CanvasRenderingContext2D} context
	 */
	apply(context) {
		const t = this.getTranslate();
		context.translate(t.x, t.y);
	}

	/**
	 * Giới hạn camera trong phạm vi map và căn giữa tầm nhìn
	 * @private
	 */
	_clamp() {
		const offsetX = Math.max(0, (this.width - this.mapWidth) / 2);
		const offsetY = Math.max(0, (this.height - this.mapHeight) / 2);

		this.viewportX = Math.max(-offsetX, Math.min(this.viewportX, this.mapWidth - this.width + offsetX));
		this.viewportY = Math.max(-offsetY, Math.min(this.viewportY, this.mapHeight - this.height + offsetY));
	}
}
