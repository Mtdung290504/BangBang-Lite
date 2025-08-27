interface Rectangle {
	type: 'rectangle';
	width: number;
	height: number;
}

interface Circle {
	type: 'circle';
	radius: number;

	/**
	 * - Góc của hình quạt, đơn vị: độ
	 * - Mặc định là hình tròn nên giá trị mặc định là 360
	 */
	'sector-angle'?: number;
}

export type Collider = Rectangle | Circle;

interface Sprite {
	/** Sprite key của thực thể để render */
	'sprite-key': string;

	/** Nếu không khai báo, mặc định lấy `frame-size` từ `sprite-manifest` */
	'render-size'?: {
		width: number;
		height: number;
	};
}

export type { Sprite };
