type ShapeName = 'rectangle' | 'circle' | 'ring';

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

/** Hình tròn bị khoét rỗng ở giữa (Vòng xuyến) */
export interface Ring extends Shape<'ring'> {
	size: {
		/** Bán kính mép trong (pixels). Mục tiêu đứng bên trong vùng này sẽ KHÔNG bị phát hiện va chạm */
		'inner-radius': number;

		/** Bán kính mép ngoài (pixels) */
		'outer-radius': number;
	};
}

/**
 * Collider - Hình dạng dùng để phát hiện va chạm
 */
export type ColliderDeclaration = Rectangle | Circle | Ring;
