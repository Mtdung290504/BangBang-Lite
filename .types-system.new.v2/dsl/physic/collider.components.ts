import { ColliderShape, PierceableTarget } from './collider.types';

export interface Collidable {
	collider?: {
		shape: ColliderShape;

		/** 
		 * Số lượng mục tiêu tối đa có thể va chạm trước khi Collider bị vô hiệu hóa.
		 * - 1 (Mặc định): Đạn thường, đụng 1 người là nổ.
		 * - 3: Đạn xuyên thấu (xuyên trúng 3 người thì vỡ) HOẶC Đạn nảy (nảy tối đa 3 lần).
		 * - 'infinity': Lazer, Vùng sát thương (Aura), Kết giới... Bất tử Collider cho đến khi hết duration.
		 */
		'impact-capacity'?: number | 'infinity';

		/** 
		 * Danh sách các mục tiêu cho phép đạn đi KHÔNG BỊ CẢN TRỞ (Không kích hoạt cơ chế Nảy hay Vỡ).
		 * VD: ['non-tank'] -> Đạn xuyên qua lính, nhưng đụng Tank là vỡ (hoặc nảy).
		 * Mặc định: Đụng ai cũng bị CẢN TRỞ.
		 */
		'passthrough-targets'?: PierceableTarget[] | 'all';

		/**
		 * - Thời gian đợi đến khi collider thực sự hoạt động
		 * - Đơn vị: s
		 * - Mặc định: 0s
		 */
		'warm-up'?: number;
	};
}
