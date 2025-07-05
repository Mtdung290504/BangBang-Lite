// @ts-check

export default class CameraSystem {
	/**
	 * @param {HTMLCanvasElement} canvas - Canvas draw game
	 * @param {{ width: number, height: number }} mapSize - Object với width, height lần lượt là chiều rộng, dài của map
	 */
	constructor(canvas, mapSize) {
		this.viewportX = 0;
		this.viewportY = 0;

		this.canvas = canvas;
		this.graphicContext = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;

		this.mapWidth = mapSize.width;
		this.mapHeight = mapSize.height;

		this.target = { x: 0, y: 0 };

		// Vùng chết là vùng không làm camera dịch chuyển (centered around camera center)
		this.deadZoneWidth = 200;
		this.deadZoneHeight = 200;
	}

	/**
	 * Set the target position for the camera to follow.
	 * (Camera sẽ dịch chuyển để có thể theo dõi "target" được truyền vào)
	 *
	 * @param {{ x: number, y: number }} target
	 */
	observe(target) {
		this.target = target;
	}

	/**
	 * Updates the camera position based on the current target.
	 */
	update() {
		const { x: targetX, y: targetY } = this.target;

		const cameraCenterX = this.viewportX + this.width / 2;
		const cameraCenterY = this.viewportY + this.height / 2;

		const dx = targetX - cameraCenterX;
		const dy = targetY - cameraCenterY;

		this.viewportX = targetX - this.width / 2;
		this.viewportY = targetY - this.height / 2;

		// Dịch camera nếu vượt khỏi dead zone theo trục X
		if (Math.abs(dx) > this.deadZoneWidth / 2) {
			this.viewportX += dx - (Math.sign(dx) * this.deadZoneWidth) / 2;
		}

		// Dịch camera nếu vượt khỏi dead zone theo trục Y
		if (Math.abs(dy) > this.deadZoneHeight / 2) {
			this.viewportY += dy - (Math.sign(dy) * this.deadZoneHeight) / 2;
		}

		this._clamp();
		this._applyTranslate();
	}

	/**
	 * Applies the calculated translation to the graphic context.
	 * (Dịch chuyển camera theo mục tiêu mà nó theo dõi)
	 *
	 * @private
	 */
	_applyTranslate() {
		this.graphicContext.translate(-this.viewportX, -this.viewportY);
	}

	/**
	 * Clamps the camera position to stay within map boundaries.
	 * (Giới hạn camera trong phạm vi map và căn giữa tầm nhìn)
	 *
	 * @private
	 */
	_clamp() {
		const offsetX = Math.max(0, (this.width - this.mapWidth) / 2);
		const offsetY = Math.max(0, (this.height - this.mapHeight) / 2);

		this.viewportX = Math.max(-offsetX, Math.min(this.viewportX, this.mapWidth - this.width + offsetX));
		this.viewportY = Math.max(-offsetY, Math.min(this.viewportY, this.mapHeight - this.height + offsetY));
	}
}
