type ShapeName = 'rectangle' | 'circle';

interface Shape<Name extends ShapeName> {
	type: Name;
	size: Record<string, number>;
}

/**Hình chữ nhật */
export interface Rectangle extends Shape<'rectangle'> {
	size: {
		/** Chiều rộng (pixels) */
		width: number;

		/** Chiều cao (pixels) */
		height: number;
	};
}

/**Hình tròn hoặc hình quạt */
export interface Circle extends Shape<'circle'> {
	size: {
		/** Bán kính (pixels) */
		radius: number;

		/** Góc cung để tạo hình quạt (degrees). Không khai báo = hình tròn đầy đủ */
		'arc-angle'?: number;
	};
}

/**
 * Collider - Hình dạng dùng để phát hiện va chạm
 */
export type ColliderDeclaration = Rectangle | Circle;
