/**
 * Chứa một giá trị để cộng vào damage khi gây ra, dùng để:
 * - Giảm/tăng sát thương đạn khi nảy/xuyên/...
 * - Sửa damage của area damage dựa trên vị trí từ tâm chẳng hạn?
 * - Nhiều trường hợp khác
 */
export default class DamageModifierComponent {
	/**
	 * - Giá trị cần cộng vào damage
	 * @param {number} value
	 */
	constructor(value) {
		this.value = value;
	}
}
