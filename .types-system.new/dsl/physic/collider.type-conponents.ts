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

		/** Khai báo các rule xuyên thấu (nếu cần) */
		pierce?: PierceableTarget[] | 'all';

		/**
		 * - Thời gian đợi đến khi collider thực sự hoạt động
		 * - Đơn vị: s
		 * - Mặc định: 0s
		 * - Ví dụ: Space GCL hiện effect trước rồi mới giật
		 */
		'warm-up'?: number;
	};
}
