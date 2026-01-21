import { PierceableTarget } from './collider.enums';
import { ColliderDeclaration } from './collider.type';

/**
 * Phát hiện va chạm
 */
export interface Collidable {
	/** Vùng va chạm để phát hiện đánh trúng */
	collider: {
		shape: ColliderDeclaration;

		/** Khai báo các rule xuyên thấu (nếu cần) */
		pierce?: Partial<Record<PierceableTarget, boolean>>;
	};
}
