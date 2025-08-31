export default createCanvasManager;

/**
 * Quản lý độ phân giải và resize cho canvas
 *
 * @param {HTMLCanvasElement} canvas - Canvas element cần quản lý
 * @param {Object} options - Các tùy chọn cấu hình
 * @param {number | 'screen'} options.resolution - Độ phân giải mặc định (default: 1080)
 * @param {boolean} options.autoResize - Tự động resize khi window thay đổi kích thước (default: true)
 * @param {boolean} [options.useDevicePixelRatio] - Sử dụng device pixel ratio (default: true)
 */
export function createCanvasManager(canvas, options) {
	// Validate canvas
	if (!canvas || !(canvas instanceof HTMLCanvasElement))
		throw new Error('> [CanvasManager] Canvas element is required and must be a valid HTMLCanvasElement');

	const config = {
		resolution: options.resolution,
		autoResize: options.autoResize,
		useDevicePixelRatio: options.useDevicePixelRatio !== false, // default true
	};

	const ctx = canvas.getContext('2d');
	if (ctx === null) throw new Error('> [CanvasManager] Context 2D is null???');

	/**@type {(() => void) | null} */
	let onWindowResizeCall = null;

	/**
	 * Resize canvas với kích thước tùy chỉnh (để gọi từ bên ngoài)
	 */
	function resize() {
		const parent = canvas.parentElement;
		if (!parent) throw new Error('> [CanvasManager] Canvas parent element is undefined???');

		// Nếu mode là screen, đặt canvas resolution bằng với parent (tức screen)
		if (config.resolution === 'screen') {
			const parent = canvas.parentElement;

			canvas.width = parent.clientWidth;
			canvas.height = parent.clientHeight;
			return;
		}

		// Nếu không, chỉnh sửa canvas resolution cho bằng resolution được cấu hình
		else {
			const dpr = config.useDevicePixelRatio ? window.devicePixelRatio || 1 : 1;
			let targetWidth = parent.clientWidth;
			let targetHeight = parent.clientHeight;

			// Kích thước hiển thị
			canvas.style.width = `${targetWidth}px`;
			canvas.style.height = `${targetHeight}px`;

			// Kích thước thực tế theo resolution
			canvas.width = ((config.resolution * targetWidth) / targetHeight) * dpr;
			canvas.height = config.resolution * dpr;

			// QUAN TRỌNG: Reset transform trước khi scale
			ctx?.setTransform(1, 0, 0, 1, 0, 0);

			// Scale để vẽ đúng tỷ lệ
			const scaleX = canvas.width / targetWidth;
			const scaleY = canvas.height / targetHeight;
			ctx?.scale(scaleX, scaleY);
		}
	}

	/**
	 * Thay đổi độ phân giải của canvas
	 * @param {number} newResolution - Độ phân giải mới
	 */
	function setResolution(newResolution) {
		if (typeof newResolution !== 'number' || newResolution <= 0) {
			throw new Error('> [CanvasManager] Resolution must be a positive number');
		}
		config.resolution = newResolution;
		resize();
	}

	/**
	 * @param {boolean} mode
	 */
	function setAutoResize(mode) {
		if (mode) _enableAutoResize();
		else _disableAutoResize();
	}

	/**
	 * Bật tự động resize khi window thay đổi kích thước
	 * @private
	 */
	function _enableAutoResize() {
		if (config.autoResize && !onWindowResizeCall) {
			onWindowResizeCall = resize;
			window.addEventListener('resize', onWindowResizeCall);
		}
	}

	/**
	 * Tắt tự động resize
	 * @private
	 */
	function _disableAutoResize() {
		if (onWindowResizeCall) {
			window.removeEventListener('resize', onWindowResizeCall);
			onWindowResizeCall = null;
		}
	}

	if (config.autoResize) _enableAutoResize(); // Khởi tạo
	resize(); // Resize lần đầu

	// Return API object
	return {
		resize,
		setAutoResize,
		setResolution,

		get config() {
			return config;
		},

		get canvas() {
			return canvas;
		},

		get context() {
			return ctx;
		},
	};
}
