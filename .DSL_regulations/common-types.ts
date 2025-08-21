interface Shape {
	type: string;
	size: any;
}

interface Rectangle extends Shape {
	type: 'rectangle';
	size: { width: number; height: number };
}

interface Circle extends Shape {
	type: 'circle';
	size: { radius: number };

	/**
	 * - Góc của hình quạt, đơn vị: độ
	 * - Mặc định là hình tròn nên giá trị mặc định là 360
	 */
	'sector-angle'?: number;
}

export type Collider = Rectangle | Circle;

interface Appearance {
	/** Sprite key của thực thể để render */
	'sprite-key': string;
}

export type { Appearance };
