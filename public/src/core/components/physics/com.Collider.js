/**
 * @template {('rectangle' | 'circle')} T
 */
export default class ColliderComponent {
	/**
	 * @param {T} type
	 * @param { T extends 'rectangle' ? { width: number, height: number }
	 * 		: T extends 'circle' ? { radius: number, 'sector-angle'?: number }
	 * 		: never
	 * } size
	 */
	constructor(type, size) {
		this.type = type;

		if (type === 'rectangle') {
			const rectSize = /** @type {{ width: number, height: number }} */ (size);
			this.width = rectSize.width;
			this.height = rectSize.height;
			this.radius = Math.sqrt(this.width * this.width + this.height * this.height);
			this.sectorAngle = 0;
		}

		if (type === 'circle') {
			const circleSize = /** @type {{ radius: number, 'sector-angle'?: number }} */ (size);
			this.radius = circleSize.radius;
			this.sectorAngle = circleSize['sector-angle'] ?? 360;
			this.width = this.height = this.radius * 2;
		}
	}

	/**
	 * @template {import('DSL/common-types.ts').Collider} C
	 * @param {C} dsl
	 * @returns {C['type'] extends 'rectangle' ? ColliderComponent<'rectangle'> : ColliderComponent<'circle'>}
	 */
	static fromDSL(dsl) {
		switch (dsl.type) {
			case 'rectangle':
				// @ts-expect-error: Suy luận không đủ mạnh nhưng dùng switch case là chắc cú rồi
				return new ColliderComponent('rectangle', {
					width: dsl.size.width,
					height: dsl.size.height,
				});

			case 'circle':
				// @ts-expect-error: Suy luận không đủ mạnh nhưng dùng switch case là chắc cú rồi
				return new ColliderComponent('circle', {
					radius: dsl.size.radius,
					'sector-angle': dsl.size['sector-angle'],
				});

			default:
				throw new Error(`> [ColliderComponent] Unknown collider type`);
		}
	}
}
