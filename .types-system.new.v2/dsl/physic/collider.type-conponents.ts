import { PierceableTarget } from './collider.enums';
import { ColliderDeclaration } from './collider.type';

/**
 * Phát hiện va chạm
 */
export interface Collidable {
	/**
	 * Vùng va chạm để phát hiện đánh trúng
	 * Mặc định lấy size tank circle r=80 (160x160)
	 */
	collider?: {
		shape: ColliderDeclaration;

		/** Mặc định: 1. Nếu 'infinity', skill là vùng vô hạn như Lazer/Aura */
		'impact-capacity'?: number | 'infinity';

		/**
		 * Danh sách các mục tiêu cho phép đạn đi KHÔNG BỊ CẢN TRỞ (Không kích hoạt cơ chế Nảy hay Vỡ).\
		 * VD: ['non-tank'] -> Đạn xuyên qua lính, nhưng đụng Tank là vỡ (hoặc nảy).\
		 * Mặc định (Nếu không có field này): Đụng ai cũng bị CẢN TRỞ.
		 */
		'pierce-targets'?: PierceableTarget[] | 'all';

		/**
		 * Danh sách các mục tiêu bị BỎ QUA hoàn toàn (xem như tàng hình, đạn đi xuyên qua và không gây impact).
		 * VD: Lựu đạn nổ lan không gây sát thương lại cho chính người ném ('parent'), hoặc đạn ký sinh không sát thương vật chủ ('target'/'parent').
		 */
		'ignore-targets'?: ('parent' | 'target' | 'self' | string)[];

		/**
		 * - Thời gian đợi đến khi collider thực sự hoạt động
		 * - Đơn vị: s
		 * - Mặc định: 0s
		 * - Ví dụ: Space GCL hiện effect trước rồi mới giật
		 */
		'warm-up'?: number;
	};
}
