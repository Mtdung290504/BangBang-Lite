export interface LimitedDuration {
	/** 
	 * Thời gian tồn tại của Logic / Effect (giây)
	 * Mặc định: 'infinity'
	 */
	duration?: number | 'infinity';
}

export type CombatState = 
	| 'stun'      // Choáng (Không di chuyển, không tung chiêu)
	| 'root'      // Khóa chân (Không di chuyển)
	| 'silence'   // Cấm phép (Không tung chiêu)
	| 'invisible' // Tàng hình (Không bị chọn làm mục tiêu)
	| 'invincible'// Bất bại (Miễn nhiễm sát thương & CC)
	| 'unstealthable'; // Chống tàng hình (Bị reveal)

export interface StateModifierEffect {
	/** Áp dụng trạng thái */
	'apply-states': CombatState[];
}

export interface Impactable {
	/** Các hành động xảy ra khi va chạm */
	impact?: any[]; // Defined in actions later
}
