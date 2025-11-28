import { ColliderDeclaration } from './collider.type';

/**
 * Phát hiện va chạm
 */
export interface Collidable {
	/** Vùng va chạm để phát hiện đánh trúng */
	collider: ColliderDeclaration;
}
