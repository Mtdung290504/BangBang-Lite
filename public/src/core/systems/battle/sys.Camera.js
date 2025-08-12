export default class CameraSystem {
	/**
	 * @param {HTMLCanvasElement} canvas - Canvas vẽ đồ họa
	 */
	constructor(canvas) {
		/**Tạm hiểu là tọa độ x góc trái trên của camera */
		this.viewportX = 0;
		/**Tạm hiểu là tọa độ y góc trái trên của camera */
		this.viewportY = 0;

		/**Tọa độ của mục tiêu cần theo dõi */
		this.targetPosition = { x: 0, y: 0 };
		this.canvas = canvas;

		/**Chiều rộng của bản đồ game */
		this.mapWidth = 0;
		/**Chiều cao của bản đồ game */
		this.mapHeight = 0;
	}

	/**Game canvas width */
	get width() {
		if (!this.canvas) return 0;
		return this.canvas.width;
	}

	/**Game canvas height */
	get height() {
		if (!this.canvas) return 0;
		return this.canvas.height;
	}

	/** Khoảng giá trị mà sự thay đổi tọa độ x của target chưa làm camera dịch chuyển */
	get deadZoneWidth() {
		return this.width / 6;
	}

	/** Khoảng giá trị mà sự thay đổi tọa độ y của target chưa làm camera dịch chuyển */
	get deadZoneHeight() {
		return this.height / 6;
	}

	/**
	 * Đặt lại kích thước bản đồ game
	 *
	 * @param {number} mapWidth
	 * @param {number} mapHeight
	 */
	setMapSize(mapWidth, mapHeight) {
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
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
		const { x: targetX, y: targetY } = this.targetPosition;

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
	 * Lấy về tọa đô cần render
	 */
	getTranslate() {
		return { x: -this.viewportX, y: -this.viewportY };
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
