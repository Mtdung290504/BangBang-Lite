/**
 * Game events mà effect có thể lắng nghe qua `on-event`.
 *
 * Nguyên tắc tối giản:
 * - Attacker-side HIT events (trước damage) bỏ → redundant với on-impact trên impactor.
 * - Attacker-side DEALT-DAMAGE event giữ → on-impact không biết damage có thực sự xảy ra không (shield, invincible,...).
 * - Filtered events (skill/normal-attack) bỏ → impactor đã có `property` phân biệt,
 *   receiver không cần biết loại hit, chỉ cần biết bị trúng.
 * - Chỉ giữ những event không biểu diễn được bằng on-impact hay cơ chế khác.
 */
export type TankEvent =
	/** Receiver: bị trúng đòn, TRƯỚC khi damage được áp */
	| 'on-hit-taken'

	/** Receiver: bị trúng đòn VÀ đã chịu damage */
	| 'on-hit-taken-damage'

	/** Attacker: gây damage thành công, SAU khi damage áp xong */
	| 'on-hit-dealt-damage'

	/** Receiver: damage SẼ giết mình, TRƯỚC khi chết */
	| 'on-fatal-damage'

	/** Attacker: giết được mục tiêu (on-kill buff, reset CD, ...) */
	| 'on-destroy'

	/** Victim: bị giết (nổ khi chết, drop item, ...) */
	| 'on-destroyed';
