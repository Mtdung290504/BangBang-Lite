export default class SpriteComponent {
	/**
	 * Component lưu trạng thái và tài nguyên sprite
	 *
	 * @param {Object} resource
	 * @param {HTMLImageElement} resource.sprite - Sprite sheet
	 * @param {import('.types/src/graphic/graphics').SpriteManifest} resource.manifest - Đặc tả sprite
	 * @param {(() => number) | undefined} [getParentLayer]
	 */
	constructor(resource, getParentLayer) {
		// Note, không có Position với angle vì sử dụng các Component đó của parent
		this.resource = resource;

		this.currentFrameIdx = 0;
		this.lastFrameIdx = this.resource.manifest['frames-position'].length;

		// Precompute layer function
		const layerConfig = resource.manifest['layer-config'];
		if (!layerConfig) {
			/**@type {() => number} */
			this.getLayer = () => 0;
		} else {
			if (layerConfig.type === 'static') this.getLayer = () => layerConfig.value;
			else if (layerConfig.type === 'relative') {
				if (!getParentLayer || typeof getParentLayer !== 'function')
					throw new TypeError('> [SpriteComponent] Invalid [getParentLayer]');
				this.getLayer = () => layerConfig.value + getParentLayer();
			}
		}

		// Precompute render-related values
		this._precomputeRenderData();

		// Cache for per-frame calculations
		/**@type {Map<number, {sx: number, sy: number, sw: number, sh: number}>} */
		this._frameCache = new Map();
	}

	/**
	 * Tính trước các giá trị cố định cho rendering
	 */
	_precomputeRenderData() {
		const manifest = this.resource.manifest;
		const frameSize = manifest['frame-size'];
		const paddingRatio = manifest['padding-ratio'] || 0;

		// Tính render size bằng size gốc hình ảnh khi bỏ padding nếu không được đặt
		if (!manifest['render-size'])
			manifest['render-size'] = {
				width: manifest['frame-size'].width * (1 - paddingRatio),
				height: manifest['frame-size'].height * (1 - paddingRatio),
			};

		// Tính trước padding
		this.paddingX = frameSize.width * paddingRatio;
		this.paddingY = frameSize.height * paddingRatio;

		// Tính trước size hình gốc (bỏ padding)
		this.actualWidth = frameSize.width - 2 * this.paddingX;
		this.actualHeight = frameSize.height - 2 * this.paddingY;
	}

	/**
	 * Lấy thông tin frame hiện tại với cache
	 * @returns Frame data with precomputed source coordinates
	 */
	getCurrentFrameData() {
		if (this.paddingX === undefined || this.paddingY === undefined)
			throw new Error('> [SpriteComponent] Padding miss???');
		if (this.actualWidth === undefined || this.actualHeight === undefined)
			throw new Error('> [SpriteComponent] Actual size miss???');

		if (this._frameCache.has(this.currentFrameIdx)) {
			const cached = this._frameCache.get(this.currentFrameIdx);
			if (cached) return cached;
		}

		const manifest = this.resource.manifest;
		const currentFrame = manifest['frames-position'][this.currentFrameIdx];

		// Precompute source coordinates (skip padding)
		const frameData = {
			sx: currentFrame.x + this.paddingX,
			sy: currentFrame.y + this.paddingY,
			sw: this.actualWidth,
			sh: this.actualHeight,
		};

		// Cache for future use
		this._frameCache.set(this.currentFrameIdx, frameData);

		return frameData;
	}

	/**
	 * Tính destination coordinates dựa trên position
	 * @param {{ x: number, y: number }} pos - Position component
	 * @returns Destination coordinates
	 */
	getDestinationCoords(pos) {
		const renderSize = this.resource.manifest['render-size'];
		if (!renderSize) throw new Error('> [SpriteComponent] Render size miss???');

		return {
			renderSize: renderSize,
			dx: pos.x - renderSize.width / 2,
			dy: pos.y - renderSize.height / 2,
			dw: renderSize.width,
			dh: renderSize.height,
		};
	}
}
