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

		/** Mặc định: 1. Nếu Infinity, skill là vùng vô hạn như Lazer/Aura */
		'impact-capacity'?: number;

		/**
		 * Danh sách các mục tiêu cho phép đạn đi KHÔNG BỊ CẢN TRỞ (Không kích hoạt cơ chế Nảy hay Vỡ).\
		 * VD: ['non-tank'] -> Đạn xuyên qua lính, nhưng đụng Tank là vỡ (hoặc nảy).\
		 * Mặc định (Nếu không có field này): Đụng ai cũng bị CẢN TRỞ.
		 */
		'pierce-targets'?: PierceableTarget[] | 'all';

		/**
		 * - Thời gian đợi đến khi collider thực sự hoạt động
		 * - Đơn vị: s
		 * - Mặc định: 0s
		 * - Ví dụ: Space GCL hiện effect trước rồi mới giật
		 */
		'warm-up'?: number;

		/**
		 * Lôi theo mục tiêu mà nó đánh trúng (khả năng đâm trúng quy định bởi filter / capacity)\
		 * Không khai báo thì là false
		 * @default false
		 */
		'drag-targets'?: true;
	};
}
