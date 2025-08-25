const canvasManager = {
	create: createCanvasManager,
};

export default canvasManager;

/**
 * Quản lý độ phân giải và resize cho canvas
 *
 * @param {HTMLCanvasElement} canvas - Canvas element cần quản lý
 * @param {Object} options - Các tùy chọn cấu hình
 * @param {number} [options.resolution] - Độ phân giải mặc định (default: 1080)
 * @param {boolean} [options.autoResize] - Tự động resize khi window thay đổi kích thước (default: true)
 * @param {boolean} [options.useDevicePixelRatio] - Sử dụng device pixel ratio (default: true)
 */
export function createCanvasManager(canvas, options = {}) {
	const DEFAULT_RESOLUTION = 1080;

	// Validate canvas
	if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas element is required and must be a valid HTMLCanvasElement');
	}

	const config = {
		resolution: options.resolution || DEFAULT_RESOLUTION,
		autoResize: options.autoResize !== false, // default true
		useDevicePixelRatio: options.useDevicePixelRatio !== false, // default true
	};

	const ctx = canvas.getContext('2d');
	if (ctx === null) throw new Error('> [CanvasManager] Context 2D is null, why???');

	/**@type {(() => void) | null} */
	let onWindowResizeCall = null;

	/**
	 * Resize canvas dựa trên tỷ lệ cửa sổ và độ phân giải
	 */
	function resize() {
		resizeToSize(window.innerWidth, window.innerHeight);
	}

	/**
	 * Resize canvas với kích thước tùy chỉnh (để gọi từ bên ngoài)
	 * @param {number} targetWidth - Chiều rộng hiển thị mục tiêu
	 * @param {number} targetHeight - Chiều cao hiển thị mục tiêu
	 */
	function resizeToSize(targetWidth, targetHeight) {
		// if (options.autoResize === true) return;
		const dpr = config.useDevicePixelRatio ? window.devicePixelRatio || 1 : 1;

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

	/**
	 * Thay đổi độ phân giải của canvas
	 * @param {number} newResolution - Độ phân giải mới
	 */
	function setResolution(newResolution) {
		if (typeof newResolution !== 'number' || newResolution <= 0) {
			throw new Error('Resolution must be a positive number');
		}
		config.resolution = newResolution;
		resize();
	}

	/**
	 * Bật tự động resize khi window thay đổi kích thước
	 */
	function enableAutoResize() {
		if (config.autoResize && !onWindowResizeCall) {
			onWindowResizeCall = resize;
			window.addEventListener('resize', onWindowResizeCall);
		}
	}

	/**
	 * Tắt tự động resize
	 */
	function disableAutoResize() {
		if (onWindowResizeCall) {
			window.removeEventListener('resize', onWindowResizeCall);
			onWindowResizeCall = null;
		}
	}

	/**
	 * Lấy thông tin hiện tại của canvas
	 */
	function getInfo() {
		return {
			resolution: config.resolution,
			autoResize: config.autoResize,
			useDevicePixelRatio: config.useDevicePixelRatio,
			canvasWidth: canvas.width,
			canvasHeight: canvas.height,
			displayWidth: canvas.style.width,
			displayHeight: canvas.style.height,
		};
	}

	// Khởi tạo
	if (config.autoResize) {
		enableAutoResize();
	}

	// Resize lần đầu
	resize();

	// Return API object
	return {
		resize,
		resizeToSize,
		setResolution,
		enableAutoResize,
		disableAutoResize,
		getInfo,

		get canvas() {
			return canvas;
		},

		get context() {
			return ctx;
		},
	};
}
