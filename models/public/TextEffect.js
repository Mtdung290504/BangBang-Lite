export default class TextEffect {
	/**
	 * @param {{ x: number, y: number }} startPos
	 * @param {number | string} value
	 * @param {string} color
	 * @param {NonNullable<import('.types-system/dsl/skills/actions/apply_effect/dealt-damage').DealtDamage['display-type']>} displayType
	 */
	constructor(startPos, value, color, displayType) {
		this.value = value.toString();
		this.color = color;
		this.x = startPos.x;
		this.y = startPos.y;
		this.displayType = displayType;
		this.speed = 2.5;
		this.duration = 500; // Tổng thời gian effect tồn tại
		this.startTime = Date.now();
		this.opacity = 1; // Khởi tạo độ mờ ban đầu là 1
	}
}
