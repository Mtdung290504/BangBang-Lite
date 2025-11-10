import { ColliderDeclaration } from './collider.type';
import { Renderable } from '../../combat/visual/visual.type-components';

/**
 * Phát hiện va chạm
 */
export interface Collidable {
	collision: {
		/** Vùng va chạm để phát hiện đánh trúng */
		hitbox: ColliderDeclaration;

		/** Visual xuất hiện khi đánh trúng mục tiêu */
		visual?: Renderable['visual'];
	};
}
